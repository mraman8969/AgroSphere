package com.project.wastemange.order.dto;

import com.project.wastemange.buyer.PickupOrDelivery;
import com.project.wastemange.order.Order;
import com.project.wastemange.order.OrderStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class OrderResponse {
    private Long id;
    private Long listingId;
    private String listingTitle;
    private Long buyerId;
    private String buyerName;
    private Long supplierId;
    private String supplierName;
    private BigDecimal quantityOrdered;
    private String unit;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;
    private BigDecimal deliveryFee;
    private BigDecimal totalAmount;
    private PickupOrDelivery pickupOrDelivery;
    private OrderStatus orderStatus;
    private String deliveryAddress;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public OrderResponse() {}

    public static OrderResponse fromEntity(Order order) {
        OrderResponse dto = new OrderResponse();
        dto.setId(order.getId());
        dto.setListingId(order.getListing() != null ? order.getListing().getId() : null);
        dto.setListingTitle(order.getListing() != null ? order.getListing().getTitle() : null);
        dto.setBuyerId(order.getBuyer() != null ? order.getBuyer().getId() : null);
        dto.setBuyerName(order.getBuyer() != null ? order.getBuyer().getFullName() : null);
        dto.setSupplierId(order.getSupplier() != null ? order.getSupplier().getId() : null);
        dto.setSupplierName(order.getSupplier() != null ? order.getSupplier().getFullName() : null);
        dto.setQuantityOrdered(order.getQuantityOrdered());
        dto.setUnit(order.getUnit());
        dto.setUnitPrice(order.getUnitPrice());
        dto.setSubtotal(order.getSubtotal());
        dto.setDeliveryFee(order.getDeliveryFee());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setPickupOrDelivery(order.getPickupOrDelivery());
        dto.setOrderStatus(order.getOrderStatus());
        dto.setDeliveryAddress(order.getDeliveryAddress());
        dto.setNotes(order.getNotes());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getListingId() {
        return listingId;
    }

    public void setListingId(Long listingId) {
        this.listingId = listingId;
    }

    public String getListingTitle() {
        return listingTitle;
    }

    public void setListingTitle(String listingTitle) {
        this.listingTitle = listingTitle;
    }

    public Long getBuyerId() {
        return buyerId;
    }

    public void setBuyerId(Long buyerId) {
        this.buyerId = buyerId;
    }

    public String getBuyerName() {
        return buyerName;
    }

    public void setBuyerName(String buyerName) {
        this.buyerName = buyerName;
    }

    public Long getSupplierId() {
        return supplierId;
    }

    public void setSupplierId(Long supplierId) {
        this.supplierId = supplierId;
    }

    public String getSupplierName() {
        return supplierName;
    }

    public void setSupplierName(String supplierName) {
        this.supplierName = supplierName;
    }

    public BigDecimal getQuantityOrdered() {
        return quantityOrdered;
    }

    public void setQuantityOrdered(BigDecimal quantityOrdered) {
        this.quantityOrdered = quantityOrdered;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getDeliveryFee() {
        return deliveryFee;
    }

    public void setDeliveryFee(BigDecimal deliveryFee) {
        this.deliveryFee = deliveryFee;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public PickupOrDelivery getPickupOrDelivery() {
        return pickupOrDelivery;
    }

    public void setPickupOrDelivery(PickupOrDelivery pickupOrDelivery) {
        this.pickupOrDelivery = pickupOrDelivery;
    }

    public OrderStatus getOrderStatus() {
        return orderStatus;
    }

    public void setOrderStatus(OrderStatus orderStatus) {
        this.orderStatus = orderStatus;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
