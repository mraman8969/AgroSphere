package com.project.wastemange.matching;

import com.project.wastemange.common.ApiResponse;
import com.project.wastemange.matching.dto.MatchResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/matches")
@Tag(name = "Matching Service", description = "Farmer listing and buyer requirement discovery and recommendation engine")
@SecurityRequirement(name = "BearerAuth")
public class MatchingController {

    private final MatchingService matchingService;

    public MatchingController(MatchingService matchingService) {
        this.matchingService = matchingService;
    }

    @GetMapping
    @PreAuthorize("hasRole('BUYER')")
    @Operation(summary = "Discover matching farmer listings for a requirement or all active buyer requirements")
    public ResponseEntity<ApiResponse<List<MatchResponse>>> getMatches(
            @RequestParam(required = false) Long requirementId) {
        List<MatchResponse> matches;
        if (requirementId != null) {
            matches = matchingService.findMatchesForRequirement(requirementId);
        } else {
            matches = matchingService.findMatchesForCurrentBuyer();
        }
        return ResponseEntity.ok(ApiResponse.success(matches));
    }
}
