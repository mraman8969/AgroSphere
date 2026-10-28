package com.project.wastemange.user;

import com.project.wastemange.common.ApiResponse;
import com.project.wastemange.user.dto.UpdateUserRequest;
import com.project.wastemange.user.dto.UserResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@Tag(name = "User Management", description = "Current authenticated user profile endpoints")
@SecurityRequirement(name = "BearerAuth")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile")
    public ResponseEntity<ApiResponse<UserResponse>> getMe() {
        UserResponse response = userService.getCurrentUserProfile();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/me")
    @Operation(summary = "Update current authenticated user details")
    public ResponseEntity<ApiResponse<UserResponse>> updateMe(@Valid @RequestBody UpdateUserRequest request) {
        UserResponse response = userService.updateCurrentUserProfile(request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }
}
