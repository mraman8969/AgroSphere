package com.project.wastemange.payment;

import com.project.wastemange.common.*;
import com.project.wastemange.order.Order;
import com.project.wastemange.order.OrderRepository;
import com.project.wastemange.order.OrderStatus;
import com.project.wastemange.payment.dto.CheckoutRequest;
import com.project.wastemange.payment.dto.CheckoutResponse;
import com.project.wastemange.payment.dto.PaymentResponse;
import com.project.wastemange.payment.dto.WebhookPayload;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final PaymentProvider paymentProvider;

    public PaymentService(PaymentRepository paymentRepository,
                          OrderRepository orderRepository,
                          PaymentProvider paymentProvider) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.paymentProvider = paymentProvider;
    }

    @Transactional
    public CheckoutResponse createCheckoutSession(Long orderId, CheckoutRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (!order.getBuyer().getId().equals(userId)) {
            throw new UnauthorizedException("Only the buyer who placed this order can start payment");
        }

        if (order.getOrderStatus() == OrderStatus.CANCELLED || order.getOrderStatus() == OrderStatus.REJECTED) {
            throw new BadRequestException("Cannot pay for an order in status: " + order.getOrderStatus());
        }

        // Handle Cash On Pickup
        if (request.getPaymentMethod() == PaymentMethod.CASH_ON_PICKUP) {
            Payment payment = paymentRepository.findByOrderId(orderId)
                    .orElseGet(() -> {
                        Payment p = new Payment();
                        p.setOrder(order);
                        return p;
                    });
            payment.setPaymentProvider("CASH_ON_PICKUP");
            payment.setProviderOrderId("COP_" + orderId);
            payment.setPaymentMethod(PaymentMethod.CASH_ON_PICKUP);
            payment.setAmount(order.getTotalAmount());
            payment.setCurrency("INR");
            payment.setPaymentStatus(PaymentStatus.PENDING);
            paymentRepository.save(payment);

            CheckoutResponse response = new CheckoutResponse();
            response.setOrderId(orderId);
            response.setProviderOrderId("COP_" + orderId);
            response.setPaymentProvider("CASH_ON_PICKUP");
            response.setPaymentMethod(PaymentMethod.CASH_ON_PICKUP);
            response.setAmount(order.getTotalAmount());
            response.setCurrency("INR");
            response.setNote("Payment will be collected as Cash on Pickup during waste collection.");
            return response;
        }

        // Online Payment via PaymentProvider
        CheckoutResponse checkout = paymentProvider.initiatePayment(order, request.getPaymentMethod());

        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseGet(() -> {
                    Payment p = new Payment();
                    p.setOrder(order);
                    return p;
                });
        payment.setPaymentProvider(checkout.getPaymentProvider());
        payment.setProviderOrderId(checkout.getProviderOrderId());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setAmount(order.getTotalAmount());
        payment.setCurrency("INR");
        payment.setPaymentStatus(PaymentStatus.CREATED);
        paymentRepository.save(payment);

        return checkout;
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByOrderId(Long orderId) {
        Long userId = SecurityUtils.getCurrentUserId();
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (!order.getBuyer().getId().equals(userId) && !order.getSupplier().getId().equals(userId)) {
            throw new UnauthorizedException("You do not have permission to view payment status for this order");
        }

        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for Order ID: " + orderId));

        return PaymentResponse.fromEntity(payment);
    }

    @Transactional
    public void processWebhook(String rawPayload, String signature, WebhookPayload payload) {
        // Step 1: Verify webhook signature
        boolean signatureValid = paymentProvider.verifyWebhookSignature(rawPayload, signature);
        if (!signatureValid) {
            log.warn("Invalid webhook signature received");
            throw new UnauthorizedException("Invalid payment webhook signature");
        }

        if (payload.getProviderOrderId() == null) {
            throw new BadRequestException("Webhook payload missing providerOrderId");
        }

        Payment payment = paymentRepository.findByProviderOrderId(payload.getProviderOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "providerOrderId", payload.getProviderOrderId()));

        // Step 2: Idempotent processing (safe handling of duplicate webhook events)
        if (payment.getPaymentStatus() == PaymentStatus.SUCCESS && payload.getStatus() == PaymentStatus.SUCCESS) {
            log.info("Duplicate successful payment webhook ignored for Order: {}", payment.getOrder().getId());
            return;
        }

        // Step 3: Update payment state
        if (payload.getStatus() != null) {
            payment.setPaymentStatus(payload.getStatus());
        } else if ("payment.successful".equalsIgnoreCase(payload.getEventType())) {
            payment.setPaymentStatus(PaymentStatus.SUCCESS);
        } else if ("payment.failed".equalsIgnoreCase(payload.getEventType())) {
            payment.setPaymentStatus(PaymentStatus.FAILED);
        } else if ("payment.refunded".equalsIgnoreCase(payload.getEventType())) {
            payment.setPaymentStatus(PaymentStatus.REFUNDED);
        }

        if (payload.getProviderTransactionId() != null) {
            payment.setProviderTransactionId(payload.getProviderTransactionId());
        }

        if (payment.getPaymentStatus() == PaymentStatus.SUCCESS) {
            payment.setPaidAt(LocalDateTime.now());
        }

        paymentRepository.save(payment);
        log.info("Processed webhook for Order ID: {}, new payment status: {}", payment.getOrder().getId(), payment.getPaymentStatus());
    }
}
