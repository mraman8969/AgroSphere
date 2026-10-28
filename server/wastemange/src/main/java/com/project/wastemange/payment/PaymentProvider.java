package com.project.wastemange.payment;

import com.project.wastemange.order.Order;
import com.project.wastemange.payment.dto.CheckoutResponse;

public interface PaymentProvider {
    String getProviderName();
    CheckoutResponse initiatePayment(Order order, PaymentMethod method);
    boolean verifyWebhookSignature(String payload, String signature);
}
