package com.project.wastemange.matching;

import com.project.wastemange.buyer.BuyerMaterialRequirement;
import com.project.wastemange.buyer.BuyerProfileRepository;
import com.project.wastemange.buyer.BuyerRequirementRepository;
import com.project.wastemange.farmer.FarmerProfile;
import com.project.wastemange.farmer.FarmerProfileRepository;
import com.project.wastemange.listing.ListingStatus;
import com.project.wastemange.listing.WasteListing;
import com.project.wastemange.listing.WasteListingRepository;
import com.project.wastemange.material.MaterialCategory;
import com.project.wastemange.material.MaterialType;
import com.project.wastemange.matching.dto.MatchResponse;
import com.project.wastemange.user.Role;
import com.project.wastemange.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MatchingServiceTest {

    @Mock
    private WasteListingRepository wasteListingRepository;

    @Mock
    private BuyerRequirementRepository buyerRequirementRepository;

    @Mock
    private BuyerProfileRepository buyerProfileRepository;

    @Mock
    private FarmerProfileRepository farmerProfileRepository;

    @InjectMocks
    private MatchingService matchingService;

    private MaterialType vegetableWaste;
    private User farmer;
    private User buyer;
    private BuyerMaterialRequirement requirement;

    @BeforeEach
    void setUp() {
        vegetableWaste = new MaterialType("Vegetable Waste", MaterialCategory.ORGANIC, "KG", "Rotting vegetables");
        vegetableWaste.setId(1L);

        farmer = new User("Ramesh Kumar", "ramesh@farmer.com", "9876543210", "hashed_pwd", Role.SUPPLIER);
        farmer.setId(10L);

        buyer = new User("Eco Compost Ltd", "eco@buyer.com", "9876543211", "hashed_pwd", Role.BUYER);
        buyer.setId(20L);

        requirement = new BuyerMaterialRequirement();
        requirement.setId(100L);
        requirement.setBuyer(buyer);
        requirement.setMaterialType(vegetableWaste);
        requirement.setRequiredQuantity(new BigDecimal("100.00"));
        requirement.setUnit("KG");
        requirement.setMaxPricePerUnit(new BigDecimal("15.00"));
        requirement.setMaxDistanceKm(new BigDecimal("50.00"));
        requirement.setPreferredCity("Pune");
        requirement.setPreferredState("Maharashtra");
    }

    @Test
    @DisplayName("Should correctly calculate Haversine distance between Pune and Mumbai")
    void testHaversineDistance() {
        // Pune ~ (18.5204, 73.8567), Mumbai ~ (19.0760, 72.8777) ~ ~120 km
        double distance = matchingService.calculateHaversineDistance(18.5204, 73.8567, 19.0760, 72.8777);
        assertTrue(distance > 115.0 && distance < 135.0, "Distance should be approximately 120-130 km, actual: " + distance);
    }

    @Test
    @DisplayName("Should find exact distance match when within maxDistanceKm")
    void testFindMatchesWithinDistance() {
        WasteListing listing = new WasteListing();
        listing.setId(500L);
        listing.setSupplier(farmer);
        listing.setMaterialType(vegetableWaste);
        listing.setTitle("Fresh Farm Cabbage Waste");
        listing.setQuantityAvailable(new BigDecimal("250.00")); // >= 100
        listing.setUnit("KG");
        listing.setPricePerUnit(new BigDecimal("10.00")); // <= 15
        listing.setLatitude(new BigDecimal("18.5300")); // Close to 18.5204
        listing.setLongitude(new BigDecimal("73.8500"));
        listing.setListingStatus(ListingStatus.AVAILABLE);

        when(wasteListingRepository.findByListingStatusAndMaterialTypeId(ListingStatus.AVAILABLE, 1L))
                .thenReturn(List.of(listing));
        when(farmerProfileRepository.findByUserId(10L)).thenReturn(Optional.empty());

        List<MatchResponse> matches = matchingService.findMatches(requirement, new BigDecimal("18.5204"), new BigDecimal("73.8567"));

        assertEquals(1, matches.size());
        assertEquals("EXACT_DISTANCE_MATCH", matches.get(0).getMatchType());
        assertNotNull(matches.get(0).getDistanceKm());
        assertTrue(matches.get(0).getDistanceKm() < 50.0);
    }

    @Test
    @DisplayName("Should filter out listing when price exceeds maxPricePerUnit")
    void testFilterOutExorbitantPrice() {
        WasteListing expensiveListing = new WasteListing();
        expensiveListing.setId(501L);
        expensiveListing.setSupplier(farmer);
        expensiveListing.setMaterialType(vegetableWaste);
        expensiveListing.setTitle("Expensive Tomato Residue");
        expensiveListing.setQuantityAvailable(new BigDecimal("200.00"));
        expensiveListing.setPricePerUnit(new BigDecimal("25.00")); // > max 15.00
        expensiveListing.setListingStatus(ListingStatus.AVAILABLE);

        when(wasteListingRepository.findByListingStatusAndMaterialTypeId(ListingStatus.AVAILABLE, 1L))
                .thenReturn(List.of(expensiveListing));

        List<MatchResponse> matches = matchingService.findMatches(requirement, null, null);

        assertTrue(matches.isEmpty(), "Should not recommend listings above maximum price");
    }

    @Test
    @DisplayName("Should fallback to city match when coordinates are unavailable")
    void testFallbackCityMatch() {
        WasteListing cityListing = new WasteListing();
        cityListing.setId(502L);
        cityListing.setSupplier(farmer);
        cityListing.setMaterialType(vegetableWaste);
        cityListing.setTitle("Organic Vegetable Waste");
        cityListing.setQuantityAvailable(new BigDecimal("150.00"));
        cityListing.setPricePerUnit(new BigDecimal("12.00"));
        cityListing.setCity("Pune");
        cityListing.setState("Maharashtra");
        cityListing.setListingStatus(ListingStatus.AVAILABLE);

        when(wasteListingRepository.findByListingStatusAndMaterialTypeId(ListingStatus.AVAILABLE, 1L))
                .thenReturn(List.of(cityListing));
        when(farmerProfileRepository.findByUserId(10L)).thenReturn(Optional.empty());

        // Null coordinates for both
        List<MatchResponse> matches = matchingService.findMatches(requirement, null, null);

        assertEquals(1, matches.size());
        assertEquals("CITY_MATCH", matches.get(0).getMatchType());
        assertNull(matches.get(0).getDistanceKm(), "Approximate match should not report arbitrary distance");
    }
}
