package com.project.wastemange.buyer;

import com.project.wastemange.material.MaterialType;
import com.project.wastemange.user.User;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "buyer_material_requirements")
public class BuyerMaterialRequirement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", nullable = false)
    private User buyer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_type_id", nullable = false)
    private MaterialType materialType;

    @Column(name = "required_quantity", nullable = false, precision = 12, scale = 3)
    private BigDecimal requiredQuantity;

    @Column(name = "unit", nullable = false, length = 20)
    private String unit;

    @Column(name = "max_price_per_unit", precision = 12, scale = 2)
    private BigDecimal maxPricePerUnit;

    @Column(name = "max_distance_km", precision = 8, scale = 2)
    private BigDecimal maxDistanceKm;

    @Column(name = "preferred_village", length = 100)
    private String preferredVillage;

    @Column(name = "preferred_city", length = 100)
    private String preferredCity;

    @Column(name = "preferred_state", length = 100)
    private String preferredState;

    @Enumerated(EnumType.STRING)
    @Column(name = "pickup_or_delivery", nullable = false, length = 20)
    private PickupOrDelivery pickupOrDelivery = PickupOrDelivery.EITHER;

    @Column(name = "active", nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public BuyerMaterialRequirement() {}

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getBuyer() {
        return buyer;
    }

    public void setBuyer(User buyer) {
        this.buyer = buyer;
    }

    public MaterialType getMaterialType() {
        return materialType;
    }

    public void setMaterialType(MaterialType materialType) {
        this.materialType = materialType;
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
