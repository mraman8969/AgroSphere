package com.project.wastemange.buyer;

import com.project.wastemange.buyer.dto.BuyerProfileRequest;
import com.project.wastemange.buyer.dto.BuyerProfileResponse;
import com.project.wastemange.common.BadRequestException;
import com.project.wastemange.common.ResourceNotFoundException;
import com.project.wastemange.common.SecurityUtils;
import com.project.wastemange.user.Role;
import com.project.wastemange.user.User;
import com.project.wastemange.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BuyerProfileService {

    private final BuyerProfileRepository buyerProfileRepository;
    private final UserRepository userRepository;

    public BuyerProfileService(BuyerProfileRepository buyerProfileRepository, UserRepository userRepository) {
        this.buyerProfileRepository = buyerProfileRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public BuyerProfileResponse getBuyerProfileById(Long id) {
        BuyerProfile profile = buyerProfileRepository.findById(id)
                .or(() -> buyerProfileRepository.findByUserId(id))
                .orElseThrow(() -> new ResourceNotFoundException("BuyerProfile", "id", id));
        return BuyerProfileResponse.fromEntity(profile);
    }

    @Transactional(readOnly = true)
    public BuyerProfileResponse getCurrentBuyerProfile() {
        Long userId = SecurityUtils.getCurrentUserId();
        BuyerProfile profile = buyerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("BuyerProfile", "userId", userId));
        return BuyerProfileResponse.fromEntity(profile);
    }

    @Transactional
    public BuyerProfileResponse updateCurrentBuyerProfile(BuyerProfileRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (user.getRole() != Role.BUYER) {
            throw new BadRequestException("Only registered buyers/recyclers can update buyer profiles");
        }

        BuyerProfile profile = buyerProfileRepository.findByUserId(userId)
                .orElseGet(() -> new BuyerProfile(user));

        if (request.getBuyerType() != null) profile.setBuyerType(request.getBuyerType());
        if (request.getOrganizationName() != null) profile.setOrganizationName(request.getOrganizationName().trim());
        if (request.getAddressLine() != null) profile.setAddressLine(request.getAddressLine().trim());
        if (request.getCity() != null) profile.setCity(request.getCity().trim());
        if (request.getState() != null) profile.setState(request.getState().trim());
        if (request.getPostalCode() != null) profile.setPostalCode(request.getPostalCode().trim());
        if (request.getLatitude() != null) profile.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) profile.setLongitude(request.getLongitude());
        if (request.getDescription() != null) profile.setDescription(request.getDescription().trim());

        BuyerProfile saved = buyerProfileRepository.save(profile);
        return BuyerProfileResponse.fromEntity(saved);
    }

    @Transactional
    public BuyerProfile createInitialProfile(User user) {
        BuyerProfile profile = new BuyerProfile(user);
        return buyerProfileRepository.save(profile);
    }
}
