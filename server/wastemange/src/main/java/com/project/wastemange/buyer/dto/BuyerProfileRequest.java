package com.project.wastemange.buyer.dto;

import com.project.wastemange.buyer.BuyerType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public class BuyerProfileRequest {

    @NotNull(message = "Buyer type is required")
    private BuyerType buyerType;

    @Size(max = 150, message = "Organization name must not exceed 150 characters")
    private String organizationName;

    @Size(max = 255, message = "Address line must not exceed 255 characters")
    private String addressLine;

    @Size(max = 100, message = "City must not exceed 100 characters")
    private String city;

    @Size(max = 100, message = "State must not exceed 100 characters")
    private String state;

    @Size(max = 15, message = "Postal code must not exceed 15 characters")
    private String postalCode;

    private BigDecimal latitude;
    private BigDecimal longitude;
    private String description;

    public BuyerProfileRequest() {}

    public BuyerType getBuyerType() {
        return buyerType;
    }

    public void setBuyerType(BuyerType buyerType) {
        this.buyerType = buyerType;
    }

    public String getOrganizationName() {
        return organizationName;
    }

    public void setOrganizationName(String organizationName) {
        this.organizationName = organizationName;
    }

    public String getAddressLine() {
        return addressLine;
    }

    public void setAddressLine(String addressLine) {
        this.addressLine = addressLine;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
