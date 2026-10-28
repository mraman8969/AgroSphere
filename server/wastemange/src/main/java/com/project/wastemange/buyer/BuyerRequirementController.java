package com.project.wastemange.buyer;

import com.project.wastemange.buyer.dto.RequirementRequest;
import com.project.wastemange.buyer.dto.RequirementResponse;
import com.project.wastemange.buyer.dto.RequirementStatusRequest;
import com.project.wastemange.common.ApiResponse;
import com.project.wastemange.common.PagedResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/buyer-requirements")
@Tag(name = "Buyer Material Requirements", description = "Buyer waste procurement requirement endpoints")
@SecurityRequirement(name = "BearerAuth")
public class BuyerRequirementController {

    private final BuyerRequirementService buyerRequirementService;

    public BuyerRequirementController(BuyerRequirementService buyerRequirementService) {
        this.buyerRequirementService = buyerRequirementService;
    }

    @PostMapping
    @PreAuthorize("hasRole('BUYER')")
    @Operation(summary = "Publish a new waste material requirement")
    public ResponseEntity<ApiResponse<RequirementResponse>> createRequirement(
            @Valid @RequestBody RequirementRequest request) {
        RequirementResponse response = buyerRequirementService.createRequirement(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Requirement published successfully", response));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('BUYER')")
    @Operation(summary = "Get list of requirements published by current authenticated buyer")
    public ResponseEntity<ApiResponse<PagedResponse<RequirementResponse>>> getMyRequirements(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PagedResponse<RequirementResponse> response = buyerRequirementService.getMyRequirements(pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('BUYER')")
    @Operation(summary = "Update an existing waste procurement requirement")
    public ResponseEntity<ApiResponse<RequirementResponse>> updateRequirement(
            @PathVariable Long id,
            @Valid @RequestBody RequirementRequest request) {
        RequirementResponse response = buyerRequirementService.updateRequirement(id, request);
        return ResponseEntity.ok(ApiResponse.success("Requirement updated successfully", response));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('BUYER')")
    @Operation(summary = "Activate or deactivate a requirement")
    public ResponseEntity<ApiResponse<RequirementResponse>> updateRequirementStatus(
            @PathVariable Long id,
            @Valid @RequestBody RequirementStatusRequest statusRequest) {
        RequirementResponse response = buyerRequirementService.updateRequirementStatus(id, statusRequest);
        return ResponseEntity.ok(ApiResponse.success("Requirement status updated successfully", response));
    }
}
