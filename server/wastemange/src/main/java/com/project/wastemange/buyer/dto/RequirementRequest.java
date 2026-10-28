package com.project.wastemange.buyer.dto;

import com.project.wastemange.buyer.PickupOrDelivery;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class RequirementRequest {

    @NotNull(message = "Material type ID is required")
    private Long materialTypeId;

    @NotNull(message = "Required quantity is required")
    @DecimalMin(value = "0.01", message = "Required quantity must be greater than zero")
    private BigDecimal requiredQuantity;

    @NotBlank(message = "Unit is required (e.g., KG, TON)")
    private String unit;

    @DecimalMin(value = "0.00", message = "Max price per unit cannot be negative")
    private BigDecimal maxPricePerUnit;

    @DecimalMin(value = "0.1", message = "Max distance must be at least 0.1 km")
    private BigDecimal maxDistanceKm;

    private String preferredVillage;
    private String preferredCity;
    private String preferredState;
    private PickupOrDelivery pickupOrDelivery = PickupOrDelivery.EITHER;

    public RequirementRequest() {}

    public Long getMaterialTypeId() {
        return materialTypeId;
    }

    public void setMaterialTypeId(Long materialTypeId) {
        this.materialTypeId = materialTypeId;
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
}
