package com.project.wastemange.farmer.dto;

import com.project.wastemange.farmer.FarmerProfile;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class FarmerProfileResponse {
    private Long id;
    private Long userId;
    private String farmerName;
    private String farmName;
    private String addressLine;
    private String village;
    private String city;
    private String state;
    private String postalCode;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String farmDescription;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public FarmerProfileResponse() {}

    public static FarmerProfileResponse fromEntity(FarmerProfile profile) {
        FarmerProfileResponse dto = new FarmerProfileResponse();
        dto.setId(profile.getId());
        dto.setUserId(profile.getUser() != null ? profile.getUser().getId() : null);
        dto.setFarmerName(profile.getFarmerName());
        dto.setFarmName(profile.getFarmName());
        dto.setAddressLine(profile.getAddressLine());
        dto.setVillage(profile.getVillage());
        dto.setCity(profile.getCity());
        dto.setState(profile.getState());
        dto.setPostalCode(profile.getPostalCode());
        dto.setLatitude(profile.getLatitude());
        dto.setLongitude(profile.getLongitude());
        dto.setFarmDescription(profile.getFarmDescription());
        dto.setCreatedAt(profile.getCreatedAt());
        dto.setUpdatedAt(profile.getUpdatedAt());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getFarmerName() {
        return farmerName;
    }

    public void setFarmerName(String farmerName) {
        this.farmerName = farmerName;
    }

    public String getFarmName() {
        return farmName;
    }

    public void setFarmName(String farmName) {
        this.farmName = farmName;
    }

    public String getAddressLine() {
        return addressLine;
    }

    public void setAddressLine(String addressLine) {
        this.addressLine = addressLine;
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

    public String getFarmDescription() {
        return farmDescription;
    }

    public void setFarmDescription(String farmDescription) {
        this.farmDescription = farmDescription;
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
