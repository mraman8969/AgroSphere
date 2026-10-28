package com.project.wastemange.order.dto;

import com.project.wastemange.buyer.PickupOrDelivery;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class OrderCreateRequest {

    @NotNull(message = "Listing ID is required")
    private Long listingId;

    @NotNull(message = "Quantity ordered is required")
    @DecimalMin(value = "0.01", message = "Quantity ordered must be greater than zero")
    private BigDecimal quantityOrdered;

    private PickupOrDelivery pickupOrDelivery = PickupOrDelivery.PICKUP;

    private String deliveryAddress;

    private String notes;

    public OrderCreateRequest() {}

    public Long getListingId() {
        return listingId;
    }

    public void setListingId(Long listingId) {
        this.listingId = listingId;
    }

    public BigDecimal getQuantityOrdered() {
        return quantityOrdered;
    }

    public void setQuantityOrdered(BigDecimal quantityOrdered) {
        this.quantityOrdered = quantityOrdered;
    }

    public PickupOrDelivery getPickupOrDelivery() {
        return pickupOrDelivery;
    }

    public void setPickupOrDelivery(PickupOrDelivery pickupOrDelivery) {
        this.pickupOrDelivery = pickupOrDelivery;
    }

    public String getDeliveryAddress() {
        return deliveryAddress;
    }

    public void setDeliveryAddress(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
