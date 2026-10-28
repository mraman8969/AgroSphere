package com.project.wastemange.user;

import com.project.wastemange.common.ConflictException;
import com.project.wastemange.common.ResourceNotFoundException;
import com.project.wastemange.common.SecurityUtils;
import com.project.wastemange.user.dto.UpdateUserRequest;
import com.project.wastemange.user.dto.UserResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUserProfile() {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return UserResponse.fromEntity(user);
    }

    @Transactional
    public UserResponse updateCurrentUserProfile(UpdateUserRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setFullName(request.getFullName().trim());
        }

        if (request.getPhone() != null && !request.getPhone().trim().isEmpty()) {
            String phone = request.getPhone().trim();
            if (!phone.equals(user.getPhone()) && userRepository.existsByPhone(phone)) {
                throw new ConflictException("Phone number is already registered by another user");
            }
            user.setPhone(phone);
        }

        User updated = userRepository.save(user);
        return UserResponse.fromEntity(updated);
    }

    @Transactional(readOnly = true)
    public User getUserEntityById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }
}
