package com.project.wastemange.listing.dto;

import com.project.wastemange.listing.ListingStatus;
import jakarta.validation.constraints.NotNull;

public class ListingStatusUpdateRequest {

    @NotNull(message = "Listing status is required")
    private ListingStatus status;

    public ListingStatusUpdateRequest() {}

    public ListingStatusUpdateRequest(ListingStatus status) {
        this.status = status;
    }

    public ListingStatus getStatus() {
        return status;
    }

    public void setStatus(ListingStatus status) {
        this.status = status;
    }
}
