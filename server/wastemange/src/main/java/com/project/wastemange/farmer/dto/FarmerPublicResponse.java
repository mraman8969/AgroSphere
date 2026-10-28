package com.project.wastemange.farmer.dto;

import com.project.wastemange.farmer.FarmerProfile;
import java.math.BigDecimal;

public class FarmerPublicResponse {
    private Long id;
    private String farmerName;
    private String farmName;
    private String village;
    private String city;
    private String state;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String farmDescription;

    public FarmerPublicResponse() {}

    public static FarmerPublicResponse fromEntity(FarmerProfile profile) {
        FarmerPublicResponse dto = new FarmerPublicResponse();
        dto.setId(profile.getId());
        dto.setFarmerName(profile.getFarmerName());
        dto.setFarmName(profile.getFarmName());
        dto.setVillage(profile.getVillage());
        dto.setCity(profile.getCity());
        dto.setState(profile.getState());
        dto.setLatitude(profile.getLatitude());
        dto.setLongitude(profile.getLongitude());
        dto.setFarmDescription(profile.getFarmDescription());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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
