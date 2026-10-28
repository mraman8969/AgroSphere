package com.project.wastemange.payment.dto;

import com.project.wastemange.payment.PaymentMethod;
import java.math.BigDecimal;

public class CheckoutResponse {

    private Long orderId;
    private String providerOrderId;
    private String paymentProvider;
    private PaymentMethod paymentMethod;
    private BigDecimal amount;
    private String currency;
    private String sandboxCheckoutUrl;
    private String clientToken;
    private String note;

    public CheckoutResponse() {}

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public String getProviderOrderId() {
        return providerOrderId;
    }

    public void setProviderOrderId(String providerOrderId) {
        this.providerOrderId = providerOrderId;
    }

    public String getPaymentProvider() {
        return paymentProvider;
    }

    public void setPaymentProvider(String paymentProvider) {
        this.paymentProvider = paymentProvider;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getSandboxCheckoutUrl() {
        return sandboxCheckoutUrl;
    }

    public void setSandboxCheckoutUrl(String sandboxCheckoutUrl) {
        this.sandboxCheckoutUrl = sandboxCheckoutUrl;
    }

    public String getClientToken() {
        return clientToken;
    }

    public void setClientToken(String clientToken) {
        this.clientToken = clientToken;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
