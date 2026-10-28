package com.project.wastemange.farmer.dto;

import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public class FarmerProfileRequest {

    @Size(max = 150, message = "Farmer name must not exceed 150 characters")
    private String farmerName;

    @Size(max = 150, message = "Farm name must not exceed 150 characters")
    private String farmName;

    @Size(max = 255, message = "Address line must not exceed 255 characters")
    private String addressLine;

    @Size(max = 100, message = "Village must not exceed 100 characters")
    private String village;

    @Size(max = 100, message = "City must not exceed 100 characters")
    private String city;

    @Size(max = 100, message = "State must not exceed 100 characters")
    private String state;

    @Size(max = 15, message = "Postal code must not exceed 15 characters")
    private String postalCode;

    private BigDecimal latitude;
    private BigDecimal longitude;
    private String farmDescription;

    public FarmerProfileRequest() {}

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
}
