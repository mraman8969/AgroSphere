package com.project.wastemange.payment;

import com.project.wastemange.order.Order;
import com.project.wastemange.payment.dto.CheckoutResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;
import java.util.UUID;

@Component
public class MockSandboxPaymentProvider implements PaymentProvider {

    private static final Logger log = LoggerFactory.getLogger(MockSandboxPaymentProvider.class);

    @Value("${app.payment.sandbox.api-key:reloop_sandbox_key_987654321}")
    private String apiKey;

    @Value("${app.payment.sandbox.webhook-secret:reloop_webhook_secret_xyz789}")
    private String webhookSecret;

    @Override
    public String getProviderName() {
        return "SANDBOX_MOCK_GATEWAY";
    }

    @Override
    public CheckoutResponse initiatePayment(Order order, PaymentMethod method) {
        String providerOrderId = "sandbox_order_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        String clientToken = "token_" + UUID.randomUUID();

        CheckoutResponse response = new CheckoutResponse();
        response.setOrderId(order.getId());
        response.setProviderOrderId(providerOrderId);
        response.setPaymentProvider(getProviderName());
        response.setPaymentMethod(method);
        response.setAmount(order.getTotalAmount());
        response.setCurrency("INR");
        response.setSandboxCheckoutUrl("https://sandbox.reloop.local/pay/" + providerOrderId);
        response.setClientToken(clientToken);
        response.setNote("Sandbox simulation environment for development. Complete with /api/payments/webhook.");

        log.info("Initialized sandbox payment for Order ID: {} with Provider Order ID: {}", order.getId(), providerOrderId);
        return response;
    }

    @Override
    public boolean verifyWebhookSignature(String payload, String signature) {
        if (signature == null || signature.isBlank() || payload == null) {
            log.warn("Missing payload or signature during webhook verification");
            return false;
        }

        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(webhookSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKey);
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String expectedSignature = HexFormat.of().formatHex(hash);

            // Constant-time comparison to prevent timing attacks
            boolean valid = java.security.MessageDigest.isEqual(
                    expectedSignature.getBytes(StandardCharsets.UTF_8),
                    signature.trim().getBytes(StandardCharsets.UTF_8)
            );

            if (!valid) {
                // If signature passed is the plain webhookSecret or sandbox key (convenient for local dev/testing)
                if (signature.equals(webhookSecret) || signature.equals("sandbox_test_signature")) {
                    return true;
                }
                log.warn("Webhook signature mismatch");
            }
            return valid;
        } catch (Exception e) {
            log.error("Error verifying webhook signature", e);
            return false;
        }
    }
}
