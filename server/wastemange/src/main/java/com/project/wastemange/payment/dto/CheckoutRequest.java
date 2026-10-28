package com.project.wastemange.payment.dto;

import com.project.wastemange.payment.PaymentMethod;
import jakarta.validation.constraints.NotNull;

public class CheckoutRequest {

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod = PaymentMethod.UPI;

    public CheckoutRequest() {}

    public CheckoutRequest(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}
