package com.project.wastemange.buyer;

import com.project.wastemange.buyer.dto.RequirementRequest;
import com.project.wastemange.buyer.dto.RequirementResponse;
import com.project.wastemange.buyer.dto.RequirementStatusRequest;
import com.project.wastemange.common.*;
import com.project.wastemange.material.MaterialService;
import com.project.wastemange.material.MaterialType;
import com.project.wastemange.user.Role;
import com.project.wastemange.user.User;
import com.project.wastemange.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BuyerRequirementService {

    private final BuyerRequirementRepository buyerRequirementRepository;
    private final UserRepository userRepository;
    private final MaterialService materialService;

    public BuyerRequirementService(BuyerRequirementRepository buyerRequirementRepository,
                                   UserRepository userRepository,
                                   MaterialService materialService) {
        this.buyerRequirementRepository = buyerRequirementRepository;
        this.userRepository = userRepository;
        this.materialService = materialService;
    }

    @Transactional
    public RequirementResponse createRequirement(RequirementRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (user.getRole() != Role.BUYER) {
            throw new BadRequestException("Only registered buyers/recyclers can publish material requirements");
        }

        MaterialType materialType = materialService.getMaterialEntityById(request.getMaterialTypeId());

        BuyerMaterialRequirement requirement = new BuyerMaterialRequirement();
        requirement.setBuyer(user);
        requirement.setMaterialType(materialType);
        requirement.setRequiredQuantity(request.getRequiredQuantity());
        requirement.setUnit(request.getUnit().toUpperCase().trim());
        requirement.setMaxPricePerUnit(request.getMaxPricePerUnit());
        requirement.setMaxDistanceKm(request.getMaxDistanceKm());
        requirement.setPreferredVillage(request.getPreferredVillage());
        requirement.setPreferredCity(request.getPreferredCity());
        requirement.setPreferredState(request.getPreferredState());
        requirement.setPickupOrDelivery(request.getPickupOrDelivery() != null ? request.getPickupOrDelivery() : PickupOrDelivery.EITHER);
        requirement.setActive(true);

        BuyerMaterialRequirement saved = buyerRequirementRepository.save(requirement);
        return RequirementResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public PagedResponse<RequirementResponse> getMyRequirements(Pageable pageable) {
        Long userId = SecurityUtils.getCurrentUserId();
        Page<BuyerMaterialRequirement> page = buyerRequirementRepository.findByBuyerId(userId, pageable);
        return PagedResponse.of(page.map(RequirementResponse::fromEntity));
    }

    @Transactional(readOnly = true)
    public RequirementResponse getRequirementById(Long id) {
        BuyerMaterialRequirement req = buyerRequirementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BuyerMaterialRequirement", "id", id));
        return RequirementResponse.fromEntity(req);
    }

    @Transactional
    public RequirementResponse updateRequirement(Long id, RequirementRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        BuyerMaterialRequirement req = buyerRequirementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BuyerMaterialRequirement", "id", id));

        if (!req.getBuyer().getId().equals(userId)) {
            throw new UnauthorizedException("You do not have permission to modify this requirement");
        }

        if (request.getMaterialTypeId() != null) {
            MaterialType materialType = materialService.getMaterialEntityById(request.getMaterialTypeId());
            req.setMaterialType(materialType);
        }
        if (request.getRequiredQuantity() != null) req.setRequiredQuantity(request.getRequiredQuantity());
        if (request.getUnit() != null) req.setUnit(request.getUnit().toUpperCase().trim());
        if (request.getMaxPricePerUnit() != null) req.setMaxPricePerUnit(request.getMaxPricePerUnit());
        if (request.getMaxDistanceKm() != null) req.setMaxDistanceKm(request.getMaxDistanceKm());
        if (request.getPreferredVillage() != null) req.setPreferredVillage(request.getPreferredVillage().trim());
        if (request.getPreferredCity() != null) req.setPreferredCity(request.getPreferredCity().trim());
        if (request.getPreferredState() != null) req.setPreferredState(request.getPreferredState().trim());
        if (request.getPickupOrDelivery() != null) req.setPickupOrDelivery(request.getPickupOrDelivery());

        BuyerMaterialRequirement updated = buyerRequirementRepository.save(req);
        return RequirementResponse.fromEntity(updated);
    }

    @Transactional
    public RequirementResponse updateRequirementStatus(Long id, RequirementStatusRequest statusRequest) {
        Long userId = SecurityUtils.getCurrentUserId();
        BuyerMaterialRequirement req = buyerRequirementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BuyerMaterialRequirement", "id", id));

        if (!req.getBuyer().getId().equals(userId)) {
            throw new UnauthorizedException("You do not have permission to change the status of this requirement");
        }

        req.setActive(statusRequest.getActive());
        BuyerMaterialRequirement updated = buyerRequirementRepository.save(req);
        return RequirementResponse.fromEntity(updated);
    }
}
