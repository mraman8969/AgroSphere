package com.project.wastemange.listing;

import com.project.wastemange.common.*;
import com.project.wastemange.farmer.FarmerProfile;
import com.project.wastemange.farmer.FarmerProfileRepository;
import com.project.wastemange.listing.dto.*;
import com.project.wastemange.material.MaterialService;
import com.project.wastemange.material.MaterialType;
import com.project.wastemange.user.Role;
import com.project.wastemange.user.User;
import com.project.wastemange.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

@Service
public class WasteListingService {

    private final WasteListingRepository wasteListingRepository;
    private final UserRepository userRepository;
    private final MaterialService materialService;
    private final FarmerProfileRepository farmerProfileRepository;

    public WasteListingService(WasteListingRepository wasteListingRepository,
                               UserRepository userRepository,
                               MaterialService materialService,
                               FarmerProfileRepository farmerProfileRepository) {
        this.wasteListingRepository = wasteListingRepository;
        this.userRepository = userRepository;
        this.materialService = materialService;
        this.farmerProfileRepository = farmerProfileRepository;
    }

    @Transactional
    public ListingResponse createListing(ListingCreateRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        User supplier = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (supplier.getRole() != Role.SUPPLIER) {
            throw new BadRequestException("Only registered farmers (suppliers) can create waste listings");
        }

        MaterialType materialType = materialService.getMaterialEntityById(request.getMaterialTypeId());

        WasteListing listing = new WasteListing();
        listing.setSupplier(supplier);
        listing.setMaterialType(materialType);
        listing.setTitle(request.getTitle().trim());
        listing.setDescription(request.getDescription());
        listing.setQuantityAvailable(request.getQuantityAvailable());
        listing.setUnit(request.getUnit().toUpperCase().trim());
        listing.setPricePerUnit(request.getPricePerUnit());
        listing.setMinimumOrderQuantity(request.getMinimumOrderQuantity() != null ? request.getMinimumOrderQuantity() : BigDecimal.ONE);

        // Populate location: use request values, or fallback to farmer profile
        Optional<FarmerProfile> farmerProfileOpt = farmerProfileRepository.findByUserId(userId);
        if (request.getPickupAddress() != null && !request.getPickupAddress().isBlank()) {
            listing.setPickupAddress(request.getPickupAddress().trim());
            listing.setVillage(request.getVillage());
            listing.setCity(request.getCity());
            listing.setState(request.getState());
            listing.setPostalCode(request.getPostalCode());
            listing.setLatitude(request.getLatitude());
            listing.setLongitude(request.getLongitude());
        } else if (farmerProfileOpt.isPresent()) {
            FarmerProfile fp = farmerProfileOpt.get();
            listing.setPickupAddress(fp.getAddressLine());
            listing.setVillage(fp.getVillage());
            listing.setCity(fp.getCity());
            listing.setState(fp.getState());
            listing.setPostalCode(fp.getPostalCode());
            listing.setLatitude(fp.getLatitude());
            listing.setLongitude(fp.getLongitude());
        }

        listing.setAvailabilityDate(request.getAvailabilityDate());
        listing.setListingStatus(ListingStatus.AVAILABLE);
        listing.setImageUrl(request.getImageUrl());

        WasteListing saved = wasteListingRepository.save(listing);
        return ListingResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public ListingResponse getListingById(Long id) {
        WasteListing listing = wasteListingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WasteListing", "id", id));
        return ListingResponse.fromEntity(listing);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ListingResponse> searchAvailableListings(Long materialTypeId, String city, String state, Pageable pageable) {
        Page<WasteListing> page = wasteListingRepository.searchListings(
                ListingStatus.AVAILABLE,
                materialTypeId,
                city,
                state,
                pageable
        );
        return PagedResponse.of(page.map(ListingResponse::fromEntity));
    }

    @Transactional(readOnly = true)
    public PagedResponse<ListingResponse> getMyListings(Pageable pageable) {
        Long userId = SecurityUtils.getCurrentUserId();
        Page<WasteListing> page = wasteListingRepository.findBySupplierId(userId, pageable);
        return PagedResponse.of(page.map(ListingResponse::fromEntity));
    }

    @Transactional
    public ListingResponse updateListing(Long id, ListingUpdateRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        WasteListing listing = wasteListingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WasteListing", "id", id));

        if (!listing.getSupplier().getId().equals(userId)) {
            throw new UnauthorizedException("You do not have permission to modify another farmer's listing");
        }

        if (request.getMaterialTypeId() != null) {
            MaterialType materialType = materialService.getMaterialEntityById(request.getMaterialTypeId());
            listing.setMaterialType(materialType);
        }
        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            listing.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null) listing.setDescription(request.getDescription().trim());
        if (request.getQuantityAvailable() != null) listing.setQuantityAvailable(request.getQuantityAvailable());
        if (request.getUnit() != null) listing.setUnit(request.getUnit().toUpperCase().trim());
        if (request.getPricePerUnit() != null) listing.setPricePerUnit(request.getPricePerUnit());
        if (request.getMinimumOrderQuantity() != null) listing.setMinimumOrderQuantity(request.getMinimumOrderQuantity());
        if (request.getPickupAddress() != null) listing.setPickupAddress(request.getPickupAddress().trim());
        if (request.getVillage() != null) listing.setVillage(request.getVillage().trim());
        if (request.getCity() != null) listing.setCity(request.getCity().trim());
        if (request.getState() != null) listing.setState(request.getState().trim());
        if (request.getPostalCode() != null) listing.setPostalCode(request.getPostalCode().trim());
        if (request.getLatitude() != null) listing.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) listing.setLongitude(request.getLongitude());
        if (request.getAvailabilityDate() != null) listing.setAvailabilityDate(request.getAvailabilityDate());
        if (request.getImageUrl() != null) listing.setImageUrl(request.getImageUrl().trim());

        WasteListing updated = wasteListingRepository.save(listing);
        return ListingResponse.fromEntity(updated);
    }

    @Transactional
    public ListingResponse updateListingStatus(Long id, ListingStatusUpdateRequest statusRequest) {
        Long userId = SecurityUtils.getCurrentUserId();
        WasteListing listing = wasteListingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WasteListing", "id", id));

        if (!listing.getSupplier().getId().equals(userId)) {
            throw new UnauthorizedException("You do not have permission to alter the status of another farmer's listing");
        }

        listing.setListingStatus(statusRequest.getStatus());
        WasteListing updated = wasteListingRepository.save(listing);
        return ListingResponse.fromEntity(updated);
    }

    @Transactional(readOnly = true)
    public WasteListing getListingEntityById(Long id) {
        return wasteListingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WasteListing", "id", id));
    }
}
