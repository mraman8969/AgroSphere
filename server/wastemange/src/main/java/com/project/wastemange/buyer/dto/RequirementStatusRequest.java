package com.project.wastemange.buyer.dto;

import jakarta.validation.constraints.NotNull;

public class RequirementStatusRequest {

    @NotNull(message = "Active status is required")
    private Boolean active;

    public RequirementStatusRequest() {}

    public RequirementStatusRequest(Boolean active) {
        this.active = active;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
