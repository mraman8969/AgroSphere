package com.project.wastemange.matching.dto;

import com.project.wastemange.farmer.dto.FarmerPublicResponse;
import com.project.wastemange.listing.dto.ListingResponse;

public class MatchResponse {

    private ListingResponse listing;
    private FarmerPublicResponse farmer;
    private Double distanceKm;
    private String matchType; // EXACT_DISTANCE_MATCH, CITY_MATCH, STATE_MATCH, GENERAL_MATCH
    private boolean priceMatched;
    private boolean quantityMatched;

    public MatchResponse() {}

    public MatchResponse(ListingResponse listing, FarmerPublicResponse farmer, Double distanceKm, String matchType, boolean priceMatched, boolean quantityMatched) {
        this.listing = listing;
        this.farmer = farmer;
        this.distanceKm = distanceKm;
        this.matchType = matchType;
        this.priceMatched = priceMatched;
        this.quantityMatched = quantityMatched;
    }

    public ListingResponse getListing() {
        return listing;
    }

    public void setListing(ListingResponse listing) {
        this.listing = listing;
    }

    public FarmerPublicResponse getFarmer() {
        return farmer;
    }

    public void setFarmer(FarmerPublicResponse farmer) {
        this.farmer = farmer;
    }

    public Double getDistanceKm() {
        return distanceKm;
    }

    public void setDistanceKm(Double distanceKm) {
        this.distanceKm = distanceKm;
    }

    public String getMatchType() {
        return matchType;
    }

    public void setMatchType(String matchType) {
        this.matchType = matchType;
    }

    public boolean isPriceMatched() {
        return priceMatched;
    }

    public void setPriceMatched(boolean priceMatched) {
        this.priceMatched = priceMatched;
    }

    public boolean isQuantityMatched() {
        return quantityMatched;
    }

    public void setQuantityMatched(boolean quantityMatched) {
        this.quantityMatched = quantityMatched;
    }
}
