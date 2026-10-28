package com.project.wastemange.farmer;

import com.project.wastemange.common.ApiResponse;
import com.project.wastemange.farmer.dto.FarmerProfileRequest;
import com.project.wastemange.farmer.dto.FarmerProfileResponse;
import com.project.wastemange.farmer.dto.FarmerPublicResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/farmers")
@Tag(name = "Farmer Profiles", description = "Farmer profile management and public directory endpoints")
public class FarmerController {

    private final FarmerProfileService farmerProfileService;

    public FarmerController(FarmerProfileService farmerProfileService) {
        this.farmerProfileService = farmerProfileService;
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get public farmer profile by profile ID (publicly visible for buyers)")
    public ResponseEntity<ApiResponse<FarmerPublicResponse>> getPublicFarmerProfile(@PathVariable Long id) {
        FarmerPublicResponse response = farmerProfileService.getPublicFarmerProfile(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/me")
    @SecurityRequirement(name = "BearerAuth")
    @PreAuthorize("hasRole('SUPPLIER')")
    @Operation(summary = "Get current authenticated farmer's complete profile")
    public ResponseEntity<ApiResponse<FarmerProfileResponse>> getCurrentFarmerProfile() {
        FarmerProfileResponse response = farmerProfileService.getCurrentFarmerProfile();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/me")
    @SecurityRequirement(name = "BearerAuth")
    @PreAuthorize("hasRole('SUPPLIER')")
    @Operation(summary = "Update current authenticated farmer profile")
    public ResponseEntity<ApiResponse<FarmerProfileResponse>> updateCurrentFarmerProfile(
            @Valid @RequestBody FarmerProfileRequest request) {
        FarmerProfileResponse response = farmerProfileService.updateCurrentFarmerProfile(request);
        return ResponseEntity.ok(ApiResponse.success("Farmer profile updated successfully", response));
    }
}
