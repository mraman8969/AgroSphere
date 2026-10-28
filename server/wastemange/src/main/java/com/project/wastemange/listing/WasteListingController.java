package com.project.wastemange.listing;

import com.project.wastemange.common.ApiResponse;
import com.project.wastemange.common.PagedResponse;
import com.project.wastemange.listing.dto.*;
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
@Tag(name = "Waste Listings", description = "Farmer waste material listings management and marketplace discovery")
public class WasteListingController {

    private final WasteListingService wasteListingService;

    public WasteListingController(WasteListingService wasteListingService) {
        this.wasteListingService = wasteListingService;
    }

    @PostMapping("/api/listings")
    @SecurityRequirement(name = "BearerAuth")
    @PreAuthorize("hasRole('SUPPLIER')")
    @Operation(summary = "Create a new farm waste listing (Farmers only)")
    public ResponseEntity<ApiResponse<ListingResponse>> createListing(@Valid @RequestBody ListingCreateRequest request) {
        ListingResponse response = wasteListingService.createListing(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Waste listing created successfully", response));
    }

    @GetMapping("/api/listings")
    @Operation(summary = "Search and filter available waste listings (Public)")
    public ResponseEntity<ApiResponse<PagedResponse<ListingResponse>>> searchListings(
            @RequestParam(required = false) Long materialTypeId,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String state,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PagedResponse<ListingResponse> response = wasteListingService.searchAvailableListings(materialTypeId, city, state, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/listings/{id}")
    @Operation(summary = "Get waste listing details by ID (Public)")
    public ResponseEntity<ApiResponse<ListingResponse>> getListingById(@PathVariable Long id) {
        ListingResponse response = wasteListingService.getListingById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/api/listings/{id}")
    @SecurityRequirement(name = "BearerAuth")
    @PreAuthorize("hasRole('SUPPLIER')")
    @Operation(summary = "Update an existing waste listing (Owner farmer only)")
    public ResponseEntity<ApiResponse<ListingResponse>> updateListing(
            @PathVariable Long id,
            @Valid @RequestBody ListingUpdateRequest request) {
        ListingResponse response = wasteListingService.updateListing(id, request);
        return ResponseEntity.ok(ApiResponse.success("Listing updated successfully", response));
    }

    @PatchMapping("/api/listings/{id}/status")
    @SecurityRequirement(name = "BearerAuth")
    @PreAuthorize("hasRole('SUPPLIER')")
    @Operation(summary = "Update listing status e.g. AVAILABLE, CLOSED (Owner farmer only)")
    public ResponseEntity<ApiResponse<ListingResponse>> updateListingStatus(
            @PathVariable Long id,
            @Valid @RequestBody ListingStatusUpdateRequest statusRequest) {
        ListingResponse response = wasteListingService.updateListingStatus(id, statusRequest);
        return ResponseEntity.ok(ApiResponse.success("Listing status updated successfully", response));
    }

    @GetMapping("/api/farmers/me/listings")
    @SecurityRequirement(name = "BearerAuth")
    @PreAuthorize("hasRole('SUPPLIER')")
    @Operation(summary = "Get all listings created by the authenticated farmer")
    public ResponseEntity<ApiResponse<PagedResponse<ListingResponse>>> getMyListings(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PagedResponse<ListingResponse> response = wasteListingService.getMyListings(pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
