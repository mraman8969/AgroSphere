package com.project.wastemange.buyer;

import com.project.wastemange.buyer.dto.BuyerProfileRequest;
import com.project.wastemange.buyer.dto.BuyerProfileResponse;
import com.project.wastemange.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/buyers")
@Tag(name = "Buyer Profiles", description = "Buyer and recycler profile management endpoints")
public class BuyerController {

    private final BuyerProfileService buyerProfileService;

    public BuyerController(BuyerProfileService buyerProfileService) {
        this.buyerProfileService = buyerProfileService;
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get buyer profile by ID")
    public ResponseEntity<ApiResponse<BuyerProfileResponse>> getBuyerProfile(@PathVariable Long id) {
        BuyerProfileResponse response = buyerProfileService.getBuyerProfileById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/me")
    @SecurityRequirement(name = "BearerAuth")
    @PreAuthorize("hasRole('BUYER')")
    @Operation(summary = "Get current authenticated buyer profile")
    public ResponseEntity<ApiResponse<BuyerProfileResponse>> getCurrentBuyerProfile() {
        BuyerProfileResponse response = buyerProfileService.getCurrentBuyerProfile();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/me")
    @SecurityRequirement(name = "BearerAuth")
    @PreAuthorize("hasRole('BUYER')")
    @Operation(summary = "Update current authenticated buyer profile")
    public ResponseEntity<ApiResponse<BuyerProfileResponse>> updateCurrentBuyerProfile(
            @Valid @RequestBody BuyerProfileRequest request) {
        BuyerProfileResponse response = buyerProfileService.updateCurrentBuyerProfile(request);
        return ResponseEntity.ok(ApiResponse.success("Buyer profile updated successfully", response));
    }
}
