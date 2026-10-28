package com.project.wastemange.buyer.dto;

import com.project.wastemange.buyer.BuyerMaterialRequirement;
import com.project.wastemange.buyer.PickupOrDelivery;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class RequirementResponse {
    private Long id;
    private Long buyerId;
    private String buyerName;
    private Long materialTypeId;
    private String materialTypeName;
    private BigDecimal requiredQuantity;
    private String unit;
    private BigDecimal maxPricePerUnit;
    private BigDecimal maxDistanceKm;
    private String preferredVillage;
    private String preferredCity;
    private String preferredState;
    private PickupOrDelivery pickupOrDelivery;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public RequirementResponse() {}

    public static RequirementResponse fromEntity(BuyerMaterialRequirement req) {
        RequirementResponse dto = new RequirementResponse();
        dto.setId(req.getId());
        dto.setBuyerId(req.getBuyer() != null ? req.getBuyer().getId() : null);
        dto.setBuyerName(req.getBuyer() != null ? req.getBuyer().getFullName() : null);
        dto.setMaterialTypeId(req.getMaterialType() != null ? req.getMaterialType().getId() : null);
        dto.setMaterialTypeName(req.getMaterialType() != null ? req.getMaterialType().getName() : null);
        dto.setRequiredQuantity(req.getRequiredQuantity());
        dto.setUnit(req.getUnit());
        dto.setMaxPricePerUnit(req.getMaxPricePerUnit());
        dto.setMaxDistanceKm(req.getMaxDistanceKm());
        dto.setPreferredVillage(req.getPreferredVillage());
        dto.setPreferredCity(req.getPreferredCity());
        dto.setPreferredState(req.getPreferredState());
        dto.setPickupOrDelivery(req.getPickupOrDelivery());
        dto.setActive(req.isActive());
        dto.setCreatedAt(req.getCreatedAt());
        dto.setUpdatedAt(req.getUpdatedAt());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Long getMaterialTypeId() {
        return materialTypeId;
    }

    public void setMaterialTypeId(Long materialTypeId) {
        this.materialTypeId = materialTypeId;
    }

    public String getMaterialTypeName() {
        return materialTypeName;
    }

    public void setMaterialTypeName(String materialTypeName) {
        this.materialTypeName = materialTypeName;
    }

    public BigDecimal getRequiredQuantity() {
        return requiredQuantity;
    }

    public void setRequiredQuantity(BigDecimal requiredQuantity) {
        this.requiredQuantity = requiredQuantity;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public BigDecimal getMaxPricePerUnit() {
        return maxPricePerUnit;
    }

    public void setMaxPricePerUnit(BigDecimal maxPricePerUnit) {
        this.maxPricePerUnit = maxPricePerUnit;
    }

    public BigDecimal getMaxDistanceKm() {
        return maxDistanceKm;
    }

    public void setMaxDistanceKm(BigDecimal maxDistanceKm) {
        this.maxDistanceKm = maxDistanceKm;
    }

    public String getPreferredVillage() {
        return preferredVillage;
    }

    public void setPreferredVillage(String preferredVillage) {
        this.preferredVillage = preferredVillage;
    }

    public String getPreferredCity() {
        return preferredCity;
    }

    public void setPreferredCity(String preferredCity) {
        this.preferredCity = preferredCity;
    }

    public String getPreferredState() {
        return preferredState;
    }

    public void setPreferredState(String preferredState) {
        this.preferredState = preferredState;
    }

    public PickupOrDelivery getPickupOrDelivery() {
        return pickupOrDelivery;
    }

    public void setPickupOrDelivery(PickupOrDelivery pickupOrDelivery) {
        this.pickupOrDelivery = pickupOrDelivery;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
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
