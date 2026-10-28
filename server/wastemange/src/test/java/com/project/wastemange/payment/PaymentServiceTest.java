package com.project.wastemange.payment;

import com.project.wastemange.config.UserPrincipal;
import com.project.wastemange.order.Order;
import com.project.wastemange.order.OrderRepository;
import com.project.wastemange.order.OrderStatus;
import com.project.wastemange.payment.dto.CheckoutRequest;
import com.project.wastemange.payment.dto.CheckoutResponse;
import com.project.wastemange.payment.dto.WebhookPayload;
import com.project.wastemange.user.Role;
import com.project.wastemange.user.User;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private PaymentProvider paymentProvider;

    @InjectMocks
    private PaymentService paymentService;

    private User buyer;
    private Order order;

    @BeforeEach
    void setUp() {
        buyer = new User("Eco Recycler", "eco@recycle.com", "9876543210", "pwd", Role.BUYER);
        buyer.setId(10L);

        order = new Order();
        order.setId(555L);
        order.setBuyer(buyer);
        order.setTotalAmount(new BigDecimal("1500.00"));
        order.setOrderStatus(OrderStatus.ACCEPTED);

        UserPrincipal principal = UserPrincipal.create(buyer);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities())
        );
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Should create online checkout session with server-calculated amount")
    void testCreateOnlineCheckout() {
        CheckoutRequest request = new CheckoutRequest(PaymentMethod.UPI);

        CheckoutResponse providerResponse = new CheckoutResponse();
        providerResponse.setOrderId(555L);
        providerResponse.setProviderOrderId("sandbox_order_123");
        providerResponse.setPaymentProvider("SANDBOX_MOCK_GATEWAY");
        providerResponse.setPaymentMethod(PaymentMethod.UPI);
        providerResponse.setAmount(new BigDecimal("1500.00"));

        when(orderRepository.findById(555L)).thenReturn(Optional.of(order));
        when(paymentProvider.initiatePayment(order, PaymentMethod.UPI)).thenReturn(providerResponse);
        when(paymentRepository.findByOrderId(555L)).thenReturn(Optional.empty());

        CheckoutResponse response = paymentService.createCheckoutSession(555L, request);

        assertNotNull(response);
        assertEquals("sandbox_order_123", response.getProviderOrderId());
        assertEquals(new BigDecimal("1500.00"), response.getAmount());

        verify(paymentRepository).save(any(Payment.class));
    }

    @Test
    @DisplayName("Should process successful webhook event idempotently")
    void testProcessWebhookIdempotent() {
        String rawPayload = "{\"providerOrderId\":\"sandbox_order_123\",\"status\":\"SUCCESS\"}";
        String signature = "valid_sig";

        WebhookPayload payload = new WebhookPayload();
        payload.setProviderOrderId("sandbox_order_123");
        payload.setStatus(PaymentStatus.SUCCESS);
        payload.setProviderTransactionId("txn_999888");

        Payment existingPayment = new Payment();
        existingPayment.setOrder(order);
        existingPayment.setProviderOrderId("sandbox_order_123");
        existingPayment.setPaymentStatus(PaymentStatus.SUCCESS); // already successful

        when(paymentProvider.verifyWebhookSignature(rawPayload, signature)).thenReturn(true);
        when(paymentRepository.findByProviderOrderId("sandbox_order_123")).thenReturn(Optional.of(existingPayment));

        // Call processWebhook
        paymentService.processWebhook(rawPayload, signature, payload);

        // Verify save was not called because it was already SUCCESS
        verify(paymentRepository, never()).save(existingPayment);
    }
}
