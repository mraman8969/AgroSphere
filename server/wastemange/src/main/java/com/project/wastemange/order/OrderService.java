package com.project.wastemange.order;

import com.project.wastemange.buyer.PickupOrDelivery;
import com.project.wastemange.common.*;
import com.project.wastemange.listing.ListingStatus;
import com.project.wastemange.listing.WasteListing;
import com.project.wastemange.listing.WasteListingRepository;
import com.project.wastemange.order.dto.OrderCreateRequest;
import com.project.wastemange.order.dto.OrderResponse;
import com.project.wastemange.user.Role;
import com.project.wastemange.user.User;
import com.project.wastemange.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final WasteListingRepository wasteListingRepository;
    private final UserRepository userRepository;

    public OrderService(OrderRepository orderRepository,
                        WasteListingRepository wasteListingRepository,
                        UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.wasteListingRepository = wasteListingRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public OrderResponse createOrder(OrderCreateRequest request) {
        Long buyerId = SecurityUtils.getCurrentUserId();
        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", buyerId));

        if (buyer.getRole() != Role.BUYER) {
            throw new BadRequestException("Only registered buyers/recyclers can place orders");
        }

        // Pessimistic lock on listing to prevent race conditions and overselling
        WasteListing listing = wasteListingRepository.findByIdWithPessimisticLock(request.getListingId())
                .orElseThrow(() -> new ResourceNotFoundException("WasteListing", "id", request.getListingId()));

        if (listing.getSupplier().getId().equals(buyerId)) {
            throw new BadRequestException("You cannot place an order on your own listing");
        }

        if (listing.getListingStatus() != ListingStatus.AVAILABLE) {
            throw new BadRequestException("Listing is currently not available for purchase (Status: " + listing.getListingStatus() + ")");
        }

        BigDecimal minOrderQty = listing.getMinimumOrderQuantity() != null ? listing.getMinimumOrderQuantity() : BigDecimal.ONE;
        if (request.getQuantityOrdered().compareTo(minOrderQty) < 0) {
            throw new BadRequestException("Quantity ordered (" + request.getQuantityOrdered() + ") is less than the minimum order quantity (" + minOrderQty + ")");
        }

        if (listing.getQuantityAvailable().compareTo(request.getQuantityOrdered()) < 0) {
            throw new BadRequestException("Insufficient stock available. Requested: " + request.getQuantityOrdered() + ", Available: " + listing.getQuantityAvailable());
        }

        // Concurrency-safe stock deduction
        BigDecimal newQuantity = listing.getQuantityAvailable().subtract(request.getQuantityOrdered());
        listing.setQuantityAvailable(newQuantity);
        if (newQuantity.compareTo(BigDecimal.ZERO) == 0) {
            listing.setListingStatus(ListingStatus.RESERVED);
        }
        wasteListingRepository.save(listing);

        // Server-side financial calculations
        BigDecimal unitPrice = listing.getPricePerUnit();
        BigDecimal subtotal = request.getQuantityOrdered().multiply(unitPrice).setScale(2, RoundingMode.HALF_UP);
        BigDecimal deliveryFee = request.getPickupOrDelivery() == PickupOrDelivery.DELIVERY ? new BigDecimal("50.00") : BigDecimal.ZERO;
        BigDecimal totalAmount = subtotal.add(deliveryFee).setScale(2, RoundingMode.HALF_UP);

        Order order = new Order();
        order.setListing(listing);
        order.setBuyer(buyer);
        order.setSupplier(listing.getSupplier());
        order.setQuantityOrdered(request.getQuantityOrdered());
        order.setUnit(listing.getUnit());
        order.setUnitPrice(unitPrice);
        order.setSubtotal(subtotal);
        order.setDeliveryFee(deliveryFee);
        order.setTotalAmount(totalAmount);
        order.setPickupOrDelivery(request.getPickupOrDelivery() != null ? request.getPickupOrDelivery() : PickupOrDelivery.PICKUP);
        order.setOrderStatus(OrderStatus.PENDING);
        order.setDeliveryAddress(request.getDeliveryAddress());
        order.setNotes(request.getNotes());

        Order saved = orderRepository.save(order);
        return OrderResponse.fromEntity(saved);
    }

    @Transactional
    public OrderResponse acceptOrder(Long orderId) {
        Long userId = SecurityUtils.getCurrentUserId();
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (!order.getSupplier().getId().equals(userId)) {
            throw new UnauthorizedException("Only the supplier farmer can accept this order");
        }

        if (order.getOrderStatus() != OrderStatus.PENDING) {
            throw new InvalidOrderStateException("Order cannot be accepted from current status: " + order.getOrderStatus());
        }

        order.setOrderStatus(OrderStatus.ACCEPTED);
        Order updated = orderRepository.save(order);
        return OrderResponse.fromEntity(updated);
    }

    @Transactional
    public OrderResponse rejectOrder(Long orderId) {
        Long userId = SecurityUtils.getCurrentUserId();
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (!order.getSupplier().getId().equals(userId)) {
            throw new UnauthorizedException("Only the supplier farmer can reject this order");
        }

        if (order.getOrderStatus() != OrderStatus.PENDING) {
            throw new InvalidOrderStateException("Order cannot be rejected from current status: " + order.getOrderStatus());
        }

        // Restore listing stock
        WasteListing listing = order.getListing();
        listing.setQuantityAvailable(listing.getQuantityAvailable().add(order.getQuantityOrdered()));
        if (listing.getListingStatus() == ListingStatus.RESERVED || listing.getListingStatus() == ListingStatus.SOLD) {
            listing.setListingStatus(ListingStatus.AVAILABLE);
        }
        wasteListingRepository.save(listing);

        order.setOrderStatus(OrderStatus.REJECTED);
        Order updated = orderRepository.save(order);
        return OrderResponse.fromEntity(updated);
    }

    @Transactional
    public OrderResponse cancelOrder(Long orderId) {
        Long userId = SecurityUtils.getCurrentUserId();
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (!order.getBuyer().getId().equals(userId)) {
            throw new UnauthorizedException("Only the buyer who placed the order can cancel it");
        }

        if (order.getOrderStatus() != OrderStatus.PENDING) {
            throw new InvalidOrderStateException("Order cannot be cancelled from status: " + order.getOrderStatus() + ". Only PENDING orders can be cancelled.");
        }

        // Restore listing stock
        WasteListing listing = order.getListing();
        listing.setQuantityAvailable(listing.getQuantityAvailable().add(order.getQuantityOrdered()));
        if (listing.getListingStatus() == ListingStatus.RESERVED || listing.getListingStatus() == ListingStatus.SOLD) {
            listing.setListingStatus(ListingStatus.AVAILABLE);
        }
        wasteListingRepository.save(listing);

        order.setOrderStatus(OrderStatus.CANCELLED);
        Order updated = orderRepository.save(order);
        return OrderResponse.fromEntity(updated);
    }

    @Transactional
    public OrderResponse completeOrder(Long orderId) {
        Long userId = SecurityUtils.getCurrentUserId();
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (!order.getSupplier().getId().equals(userId) && !order.getBuyer().getId().equals(userId)) {
            throw new UnauthorizedException("Only the buyer or supplier associated with this order can mark it as completed");
        }

        if (order.getOrderStatus() != OrderStatus.ACCEPTED) {
            throw new InvalidOrderStateException("Order must be ACCEPTED before it can be marked as COMPLETED. Current status: " + order.getOrderStatus());
        }

        order.setOrderStatus(OrderStatus.COMPLETED);

        // Mark listing as SOLD if quantity is 0
        WasteListing listing = order.getListing();
        if (listing.getQuantityAvailable().compareTo(BigDecimal.ZERO) <= 0) {
            listing.setListingStatus(ListingStatus.SOLD);
            wasteListingRepository.save(listing);
        }

        Order updated = orderRepository.save(order);
        return OrderResponse.fromEntity(updated);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long orderId) {
        Long userId = SecurityUtils.getCurrentUserId();
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (!order.getBuyer().getId().equals(userId) && !order.getSupplier().getId().equals(userId)) {
            throw new UnauthorizedException("You do not have permission to view this order");
        }

        return OrderResponse.fromEntity(order);
    }

    @Transactional(readOnly = true)
    public PagedResponse<OrderResponse> getMyOrders(Pageable pageable) {
        Long userId = SecurityUtils.getCurrentUserId();
        Page<Order> page = orderRepository.findByBuyerIdOrSupplierId(userId, pageable);
        return PagedResponse.of(page.map(OrderResponse::fromEntity));
    }

    @Transactional(readOnly = true)
    public Order getOrderEntityById(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
    }
}
