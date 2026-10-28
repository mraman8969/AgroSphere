package com.project.wastemange.payment;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.wastemange.common.ApiResponse;
import com.project.wastemange.payment.dto.CheckoutRequest;
import com.project.wastemange.payment.dto.CheckoutResponse;
import com.project.wastemange.payment.dto.PaymentResponse;
import com.project.wastemange.payment.dto.WebhookPayload;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@Tag(name = "Payments", description = "Order payment initiation, status tracking, and webhook gateway adapter")
public class PaymentController {

    private final PaymentService paymentService;
    private final ObjectMapper objectMapper;

    public PaymentController(PaymentService paymentService, ObjectMapper objectMapper) {
        this.paymentService = paymentService;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/orders/{orderId}/checkout")
    @SecurityRequirement(name = "BearerAuth")
    @PreAuthorize("hasRole('BUYER')")
    @Operation(summary = "Initiate checkout for an eligible order (UPI / Card / Cash on pickup)")
    public ResponseEntity<ApiResponse<CheckoutResponse>> initiateCheckout(
            @PathVariable Long orderId,
            @Valid @RequestBody CheckoutRequest request) {
        CheckoutResponse response = paymentService.createCheckoutSession(orderId, request);
        return ResponseEntity.ok(ApiResponse.success("Checkout session created", response));
    }

    @GetMapping("/orders/{orderId}")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Get payment details and status for an order")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentStatus(@PathVariable Long orderId) {
        PaymentResponse response = paymentService.getPaymentByOrderId(orderId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/webhook")
    @Operation(summary = "Gateway webhook endpoint for automated payment notifications and signature verification")
    public ResponseEntity<ApiResponse<String>> handleWebhook(
            @RequestHeader(value = "X-Payment-Signature", required = false) String signature,
            @RequestBody String rawPayload) throws Exception {
        WebhookPayload payload = objectMapper.readValue(rawPayload, WebhookPayload.class);
        paymentService.processWebhook(rawPayload, signature, payload);
        return ResponseEntity.ok(ApiResponse.success("Webhook event processed successfully", "OK"));
    }
}
