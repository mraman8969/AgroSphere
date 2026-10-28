package com.project.wastemange.order;

import com.project.wastemange.common.ApiResponse;
import com.project.wastemange.common.PagedResponse;
import com.project.wastemange.order.dto.OrderCreateRequest;
import com.project.wastemange.order.dto.OrderResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@Tag(name = "Orders", description = "Order workflow, lifecycle state machine, and stock management")
@SecurityRequirement(name = "BearerAuth")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    @PreAuthorize("hasRole('BUYER')")
    @Operation(summary = "Place a new order for agricultural or vegetable waste (Buyers only)")
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(@Valid @RequestBody OrderCreateRequest request) {
        OrderResponse response = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Order placed successfully", response));
    }

    @GetMapping("/me")
    @Operation(summary = "Get list of orders placed or received by current authenticated user")
    public ResponseEntity<ApiResponse<PagedResponse<OrderResponse>>> getMyOrders(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PagedResponse<OrderResponse> response = orderService.getMyOrders(pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get detailed order information by order ID")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(@PathVariable Long id) {
        OrderResponse response = orderService.getOrderById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/{id}/accept")
    @PreAuthorize("hasRole('SUPPLIER')")
    @Operation(summary = "Farmer accepts an incoming order")
    public ResponseEntity<ApiResponse<OrderResponse>> acceptOrder(@PathVariable Long id) {
        OrderResponse response = orderService.acceptOrder(id);
        return ResponseEntity.ok(ApiResponse.success("Order accepted successfully", response));
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('SUPPLIER')")
    @Operation(summary = "Farmer rejects an incoming order and returns stock to listing")
    public ResponseEntity<ApiResponse<OrderResponse>> rejectOrder(@PathVariable Long id) {
        OrderResponse response = orderService.rejectOrder(id);
        return ResponseEntity.ok(ApiResponse.success("Order rejected and stock restored", response));
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasRole('BUYER')")
    @Operation(summary = "Buyer cancels a pending order and returns stock to listing")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(@PathVariable Long id) {
        OrderResponse response = orderService.cancelOrder(id);
        return ResponseEntity.ok(ApiResponse.success("Order cancelled and stock restored", response));
    }

    @PatchMapping("/{id}/complete")
    @Operation(summary = "Mark an accepted order as fulfilled / completed")
    public ResponseEntity<ApiResponse<OrderResponse>> completeOrder(@PathVariable Long id) {
        OrderResponse response = orderService.completeOrder(id);
        return ResponseEntity.ok(ApiResponse.success("Order completed successfully", response));
    }
}
