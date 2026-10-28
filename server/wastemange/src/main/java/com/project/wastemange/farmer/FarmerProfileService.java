package com.project.wastemange.farmer;

import com.project.wastemange.common.BadRequestException;
import com.project.wastemange.common.ResourceNotFoundException;
import com.project.wastemange.common.SecurityUtils;
import com.project.wastemange.farmer.dto.FarmerProfileRequest;
import com.project.wastemange.farmer.dto.FarmerProfileResponse;
import com.project.wastemange.farmer.dto.FarmerPublicResponse;
import com.project.wastemange.user.Role;
import com.project.wastemange.user.User;
import com.project.wastemange.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FarmerProfileService {

    private final FarmerProfileRepository farmerProfileRepository;
    private final UserRepository userRepository;

    public FarmerProfileService(FarmerProfileRepository farmerProfileRepository, UserRepository userRepository) {
        this.farmerProfileRepository = farmerProfileRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public FarmerPublicResponse getPublicFarmerProfile(Long id) {
        FarmerProfile profile = farmerProfileRepository.findById(id)
                .or(() -> farmerProfileRepository.findByUserId(id))
                .orElseThrow(() -> new ResourceNotFoundException("FarmerProfile", "id", id));
        return FarmerPublicResponse.fromEntity(profile);
    }

    @Transactional(readOnly = true)
    public FarmerProfileResponse getCurrentFarmerProfile() {
        Long userId = SecurityUtils.getCurrentUserId();
        FarmerProfile profile = farmerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("FarmerProfile", "userId", userId));
        return FarmerProfileResponse.fromEntity(profile);
    }

    @Transactional
    public FarmerProfileResponse updateCurrentFarmerProfile(FarmerProfileRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (user.getRole() != Role.SUPPLIER) {
            throw new BadRequestException("Only registered farmers (suppliers) can update farmer profiles");
        }

        FarmerProfile profile = farmerProfileRepository.findByUserId(userId)
                .orElseGet(() -> new FarmerProfile(user));

        if (request.getFarmerName() != null) profile.setFarmerName(request.getFarmerName().trim());
        if (request.getFarmName() != null) profile.setFarmName(request.getFarmName().trim());
        if (request.getAddressLine() != null) profile.setAddressLine(request.getAddressLine().trim());
        if (request.getVillage() != null) profile.setVillage(request.getVillage().trim());
        if (request.getCity() != null) profile.setCity(request.getCity().trim());
        if (request.getState() != null) profile.setState(request.getState().trim());
        if (request.getPostalCode() != null) profile.setPostalCode(request.getPostalCode().trim());
        if (request.getLatitude() != null) profile.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) profile.setLongitude(request.getLongitude());
        if (request.getFarmDescription() != null) profile.setFarmDescription(request.getFarmDescription().trim());

        FarmerProfile saved = farmerProfileRepository.save(profile);
        return FarmerProfileResponse.fromEntity(saved);
    }

    @Transactional
    public FarmerProfile createInitialProfile(User user) {
        FarmerProfile profile = new FarmerProfile(user);
        return farmerProfileRepository.save(profile);
    }
}
