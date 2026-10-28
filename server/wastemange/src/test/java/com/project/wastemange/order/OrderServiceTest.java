package com.project.wastemange.order;

import com.project.wastemange.buyer.PickupOrDelivery;
import com.project.wastemange.common.BadRequestException;
import com.project.wastemange.common.InvalidOrderStateException;
import com.project.wastemange.config.UserPrincipal;
import com.project.wastemange.listing.ListingStatus;
import com.project.wastemange.listing.WasteListing;
import com.project.wastemange.listing.WasteListingRepository;
import com.project.wastemange.material.MaterialCategory;
import com.project.wastemange.material.MaterialType;
import com.project.wastemange.order.dto.OrderCreateRequest;
import com.project.wastemange.order.dto.OrderResponse;
import com.project.wastemange.user.Role;
import com.project.wastemange.user.User;
import com.project.wastemange.user.UserRepository;
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
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private WasteListingRepository wasteListingRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private OrderService orderService;

    private User buyer;
    private User farmer;
    private WasteListing listing;

    @BeforeEach
    void setUp() {
        buyer = new User("Green Biotech", "bio@buyer.com", "9998887770", "hash", Role.BUYER);
        buyer.setId(101L);

        farmer = new User("Suresh Patel", "suresh@farmer.com", "9998887771", "hash", Role.SUPPLIER);
        farmer.setId(202L);

        MaterialType material = new MaterialType("Vegetable Waste", MaterialCategory.ORGANIC, "KG", "Rotting cabbage");
        material.setId(1L);

        listing = new WasteListing();
        listing.setId(301L);
        listing.setSupplier(farmer);
        listing.setMaterialType(material);
        listing.setTitle("Cabbage Waste");
        listing.setQuantityAvailable(new BigDecimal("100.00"));
        listing.setUnit("KG");
        listing.setPricePerUnit(new BigDecimal("10.00"));
        listing.setMinimumOrderQuantity(new BigDecimal("10.00"));
        listing.setListingStatus(ListingStatus.AVAILABLE);

        // Mock current security context as buyer
        UserPrincipal principal = UserPrincipal.create(buyer);
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Should successfully place an order and deduct listing stock")
    void testCreateOrderSuccess() {
        OrderCreateRequest request = new OrderCreateRequest();
        request.setListingId(301L);
        request.setQuantityOrdered(new BigDecimal("40.00"));
        request.setPickupOrDelivery(PickupOrDelivery.PICKUP);

        when(userRepository.findById(101L)).thenReturn(Optional.of(buyer));
        when(wasteListingRepository.findByIdWithPessimisticLock(301L)).thenReturn(Optional.of(listing));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order o = invocation.getArgument(0);
            o.setId(999L);
            return o;
        });

        OrderResponse response = orderService.createOrder(request);

        assertNotNull(response);
        assertEquals(new BigDecimal("40.00"), response.getQuantityOrdered());
        assertEquals(new BigDecimal("400.00"), response.getSubtotal()); // 40 * 10
        assertEquals(0, BigDecimal.ZERO.compareTo(response.getDeliveryFee())); // PICKUP
        assertEquals(new BigDecimal("400.00"), response.getTotalAmount());
        assertEquals(OrderStatus.PENDING, response.getOrderStatus());

        // Stock was reduced to 60
        assertEquals(new BigDecimal("60.00"), listing.getQuantityAvailable());
        assertEquals(ListingStatus.AVAILABLE, listing.getListingStatus());
        verify(wasteListingRepository).save(listing);
    }

    @Test
    @DisplayName("Should throw BadRequestException when ordering more than available stock")
    void testCreateOrderInsufficientStock() {
        OrderCreateRequest request = new OrderCreateRequest();
        request.setListingId(301L);
        request.setQuantityOrdered(new BigDecimal("150.00")); // available is 100

        when(userRepository.findById(101L)).thenReturn(Optional.of(buyer));
        when(wasteListingRepository.findByIdWithPessimisticLock(301L)).thenReturn(Optional.of(listing));

        assertThrows(BadRequestException.class, () -> orderService.createOrder(request));
        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("Farmer should accept a pending order successfully")
    void testAcceptOrder() {
        // Authenticate as farmer
        UserPrincipal farmerPrincipal = UserPrincipal.create(farmer);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(farmerPrincipal, null, farmerPrincipal.getAuthorities())
        );

        Order order = new Order();
        order.setId(888L);
        order.setSupplier(farmer);
        order.setBuyer(buyer);
        order.setListing(listing);
        order.setOrderStatus(OrderStatus.PENDING);
        order.setQuantityOrdered(new BigDecimal("20.00"));
        order.setUnitPrice(new BigDecimal("10.00"));
        order.setSubtotal(new BigDecimal("200.00"));
        order.setDeliveryFee(BigDecimal.ZERO);
        order.setTotalAmount(new BigDecimal("200.00"));
        order.setUnit("KG");

        when(orderRepository.findById(888L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        OrderResponse response = orderService.acceptOrder(888L);

        assertEquals(OrderStatus.ACCEPTED, response.getOrderStatus());
    }

    @Test
    @DisplayName("Farmer rejecting order restores stock to listing")
    void testRejectOrderRestoresStock() {
        // Authenticate as farmer
        UserPrincipal farmerPrincipal = UserPrincipal.create(farmer);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(farmerPrincipal, null, farmerPrincipal.getAuthorities())
        );

        listing.setQuantityAvailable(new BigDecimal("80.00")); // was reduced by 20

        Order order = new Order();
        order.setId(888L);
        order.setSupplier(farmer);
        order.setBuyer(buyer);
        order.setListing(listing);
        order.setOrderStatus(OrderStatus.PENDING);
        order.setQuantityOrdered(new BigDecimal("20.00"));
        order.setUnitPrice(new BigDecimal("10.00"));
        order.setSubtotal(new BigDecimal("200.00"));
        order.setDeliveryFee(BigDecimal.ZERO);
        order.setTotalAmount(new BigDecimal("200.00"));
        order.setUnit("KG");

        when(orderRepository.findById(888L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        OrderResponse response = orderService.rejectOrder(888L);

        assertEquals(OrderStatus.REJECTED, response.getOrderStatus());
        assertEquals(new BigDecimal("100.00"), listing.getQuantityAvailable(), "Stock should be restored from 80 back to 100");
        verify(wasteListingRepository).save(listing);
    }
}
