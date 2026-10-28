package com.project.wastemange.matching;

import com.project.wastemange.buyer.BuyerMaterialRequirement;
import com.project.wastemange.buyer.BuyerProfile;
import com.project.wastemange.buyer.BuyerProfileRepository;
import com.project.wastemange.buyer.BuyerRequirementRepository;
import com.project.wastemange.common.ResourceNotFoundException;
import com.project.wastemange.common.SecurityUtils;
import com.project.wastemange.farmer.FarmerProfile;
import com.project.wastemange.farmer.FarmerProfileRepository;
import com.project.wastemange.farmer.dto.FarmerPublicResponse;
import com.project.wastemange.listing.ListingStatus;
import com.project.wastemange.listing.WasteListing;
import com.project.wastemange.listing.WasteListingRepository;
import com.project.wastemange.listing.dto.ListingResponse;
import com.project.wastemange.matching.dto.MatchResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MatchingService {

    private static final double EARTH_RADIUS_KM = 6371.0;

    private final WasteListingRepository wasteListingRepository;
    private final BuyerRequirementRepository buyerRequirementRepository;
    private final BuyerProfileRepository buyerProfileRepository;
    private final FarmerProfileRepository farmerProfileRepository;

    public MatchingService(WasteListingRepository wasteListingRepository,
                           BuyerRequirementRepository buyerRequirementRepository,
                           BuyerProfileRepository buyerProfileRepository,
                           FarmerProfileRepository farmerProfileRepository) {
        this.wasteListingRepository = wasteListingRepository;
        this.buyerRequirementRepository = buyerRequirementRepository;
        this.buyerProfileRepository = buyerProfileRepository;
        this.farmerProfileRepository = farmerProfileRepository;
    }

    @Transactional(readOnly = true)
    public List<MatchResponse> findMatchesForRequirement(Long requirementId) {
        BuyerMaterialRequirement requirement = buyerRequirementRepository.findById(requirementId)
                .orElseThrow(() -> new ResourceNotFoundException("BuyerMaterialRequirement", "id", requirementId));

        // Get buyer coordinates from profile if present
        Optional<BuyerProfile> buyerProfile = buyerProfileRepository.findByUserId(requirement.getBuyer().getId());
        BigDecimal buyerLat = buyerProfile.map(BuyerProfile::getLatitude).orElse(null);
        BigDecimal buyerLon = buyerProfile.map(BuyerProfile::getLongitude).orElse(null);

        return findMatches(requirement, buyerLat, buyerLon);
    }

    @Transactional(readOnly = true)
    public List<MatchResponse> findMatchesForCurrentBuyer() {
        Long userId = SecurityUtils.getCurrentUserId();
        List<BuyerMaterialRequirement> activeRequirements = buyerRequirementRepository.findByBuyerIdAndActiveTrue(userId);

        Optional<BuyerProfile> buyerProfile = buyerProfileRepository.findByUserId(userId);
        BigDecimal buyerLat = buyerProfile.map(BuyerProfile::getLatitude).orElse(null);
        BigDecimal buyerLon = buyerProfile.map(BuyerProfile::getLongitude).orElse(null);

        List<MatchResponse> allMatches = new ArrayList<>();
        for (BuyerMaterialRequirement req : activeRequirements) {
            allMatches.addAll(findMatches(req, buyerLat, buyerLon));
        }

        // Deduplicate listings across multiple requirements of the buyer
        Map<Long, MatchResponse> uniqueMatches = new LinkedHashMap<>();
        for (MatchResponse match : allMatches) {
            uniqueMatches.putIfAbsent(match.getListing().getId(), match);
        }

        return new ArrayList<>(uniqueMatches.values());
    }

    public List<MatchResponse> findMatches(BuyerMaterialRequirement requirement, BigDecimal buyerLat, BigDecimal buyerLon) {
        // Rule 1: Material types must match, and listing must be AVAILABLE
        List<WasteListing> candidateListings = wasteListingRepository.findByListingStatusAndMaterialTypeId(
                ListingStatus.AVAILABLE,
                requirement.getMaterialType().getId()
        );

        List<MatchResponse> matches = new ArrayList<>();

        for (WasteListing listing : candidateListings) {
            // Rule 2: Available quantity must meet requested quantity
            if (listing.getQuantityAvailable().compareTo(requirement.getRequiredQuantity()) < 0) {
                continue;
            }

            // Rule 3: Listing price must not exceed buyer's maximum price when set
            if (requirement.getMaxPricePerUnit() != null &&
                    listing.getPricePerUnit().compareTo(requirement.getMaxPricePerUnit()) > 0) {
                continue;
            }

            // Location handling: Distance calculation or city/state fallback
            Double distanceKm = null;
            String matchType = "GENERAL_MATCH";

            BigDecimal listingLat = listing.getLatitude();
            BigDecimal listingLon = listing.getLongitude();

            if (listingLat != null && listingLon != null && buyerLat != null && buyerLon != null) {
                double computedDistance = calculateHaversineDistance(
                        buyerLat.doubleValue(), buyerLon.doubleValue(),
                        listingLat.doubleValue(), listingLon.doubleValue()
                );

                // Rule 4: Apply buyer distance limit when coordinates are available
                if (requirement.getMaxDistanceKm() != null &&
                        computedDistance > requirement.getMaxDistanceKm().doubleValue()) {
                    continue;
                }

                distanceKm = Math.round(computedDistance * 100.0) / 100.0;
                matchType = "EXACT_DISTANCE_MATCH";
            } else {
                // Rule 5: Fallback to city or state matching when coordinates unavailable
                boolean hasPreferredCity = requirement.getPreferredCity() != null && !requirement.getPreferredCity().isBlank();
                boolean hasPreferredState = requirement.getPreferredState() != null && !requirement.getPreferredState().isBlank();

                if (hasPreferredCity || hasPreferredState) {
                    boolean cityMatches = hasPreferredCity && listing.getCity() != null &&
                            listing.getCity().trim().equalsIgnoreCase(requirement.getPreferredCity().trim());
                    boolean stateMatches = hasPreferredState && listing.getState() != null &&
                            listing.getState().trim().equalsIgnoreCase(requirement.getPreferredState().trim());

                    if (cityMatches) {
                        matchType = "CITY_MATCH";
                    } else if (stateMatches) {
                        matchType = "STATE_MATCH";
                    } else {
                        // Location was preferred but did not match
                        continue;
                    }
                }
            }

            // Rule 6: Return listing details, available quantity, rate, location, farmer public profile
            ListingResponse listingDto = ListingResponse.fromEntity(listing);
            FarmerPublicResponse farmerDto = null;
            if (listing.getSupplier() != null) {
                Optional<FarmerProfile> fp = farmerProfileRepository.findByUserId(listing.getSupplier().getId());
                farmerDto = fp.map(FarmerPublicResponse::fromEntity).orElseGet(() -> {
                    FarmerPublicResponse fallback = new FarmerPublicResponse();
                    fallback.setFarmerName(listing.getSupplier().getFullName());
                    fallback.setCity(listing.getCity());
                    fallback.setState(listing.getState());
                    return fallback;
                });
            }

            matches.add(new MatchResponse(listingDto, farmerDto, distanceKm, matchType, true, true));
        }

        // Sort: Exact distance matches first (ascending distance), then lowest price per unit
        matches.sort((a, b) -> {
            if (a.getDistanceKm() != null && b.getDistanceKm() != null) {
                return Double.compare(a.getDistanceKm(), b.getDistanceKm());
            } else if (a.getDistanceKm() != null) {
                return -1;
            } else if (b.getDistanceKm() != null) {
                return 1;
            } else {
                return a.getListing().getPricePerUnit().compareTo(b.getListing().getPricePerUnit());
            }
        });

        return matches;
    }

    /**
     * Calculates great-circle distance between two geographic coordinates using the Haversine formula.
     */
    public double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }
}
