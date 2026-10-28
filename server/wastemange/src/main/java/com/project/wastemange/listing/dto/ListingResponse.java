package com.project.wastemange.listing.dto;

import com.project.wastemange.listing.ListingStatus;
import com.project.wastemange.listing.WasteListing;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ListingResponse {
    private Long id;
    private Long supplierId;
    private String supplierName;
    private Long materialTypeId;
    private String materialTypeName;
    private String title;
    private String description;
    private BigDecimal quantityAvailable;
    private String unit;
    private BigDecimal pricePerUnit;
    private BigDecimal minimumOrderQuantity;
    private String pickupAddress;
    private String village;
    private String city;
    private String state;
    private String postalCode;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private LocalDate availabilityDate;
    private ListingStatus listingStatus;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ListingResponse() {}

    public static ListingResponse fromEntity(WasteListing listing) {
        ListingResponse dto = new ListingResponse();
        dto.setId(listing.getId());
        dto.setSupplierId(listing.getSupplier() != null ? listing.getSupplier().getId() : null);
        dto.setSupplierName(listing.getSupplier() != null ? listing.getSupplier().getFullName() : null);
        dto.setMaterialTypeId(listing.getMaterialType() != null ? listing.getMaterialType().getId() : null);
        dto.setMaterialTypeName(listing.getMaterialType() != null ? listing.getMaterialType().getName() : null);
        dto.setTitle(listing.getTitle());
        dto.setDescription(listing.getDescription());
        dto.setQuantityAvailable(listing.getQuantityAvailable());
        dto.setUnit(listing.getUnit());
        dto.setPricePerUnit(listing.getPricePerUnit());
        dto.setMinimumOrderQuantity(listing.getMinimumOrderQuantity());
        dto.setPickupAddress(listing.getPickupAddress());
        dto.setVillage(listing.getVillage());
        dto.setCity(listing.getCity());
        dto.setState(listing.getState());
        dto.setPostalCode(listing.getPostalCode());
        dto.setLatitude(listing.getLatitude());
        dto.setLongitude(listing.getLongitude());
        dto.setAvailabilityDate(listing.getAvailabilityDate());
        dto.setListingStatus(listing.getListingStatus());
        dto.setImageUrl(listing.getImageUrl());
        dto.setCreatedAt(listing.getCreatedAt());
        dto.setUpdatedAt(listing.getUpdatedAt());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getQuantityAvailable() {
        return quantityAvailable;
    }

    public void setQuantityAvailable(BigDecimal quantityAvailable) {
        this.quantityAvailable = quantityAvailable;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public BigDecimal getPricePerUnit() {
        return pricePerUnit;
    }

    public void setPricePerUnit(BigDecimal pricePerUnit) {
        this.pricePerUnit = pricePerUnit;
    }

    public BigDecimal getMinimumOrderQuantity() {
        return minimumOrderQuantity;
    }

    public void setMinimumOrderQuantity(BigDecimal minimumOrderQuantity) {
        this.minimumOrderQuantity = minimumOrderQuantity;
    }

    public String getPickupAddress() {
        return pickupAddress;
    }

    public void setPickupAddress(String pickupAddress) {
        this.pickupAddress = pickupAddress;
    }

    public String getVillage() {
        return village;
    }

    public void setVillage(String village) {
        this.village = village;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }

    public BigDecimal getLatitude() {
        return latitude;
    }

    public void setLatitude(BigDecimal latitude) {
        this.latitude = latitude;
    }

    public BigDecimal getLongitude() {
        return longitude;
    }

    public void setLongitude(BigDecimal longitude) {
        this.longitude = longitude;
    }

    public LocalDate getAvailabilityDate() {
        return availabilityDate;
    }

    public void setAvailabilityDate(LocalDate availabilityDate) {
        this.availabilityDate = availabilityDate;
    }

    public ListingStatus getListingStatus() {
        return listingStatus;
    }

    public void setListingStatus(ListingStatus listingStatus) {
        this.listingStatus = listingStatus;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
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
