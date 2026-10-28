package com.project.wastemange.user.dto;

import com.project.wastemange.user.AccountStatus;
import com.project.wastemange.user.Role;
import com.project.wastemange.user.User;

import java.time.LocalDateTime;

public class UserResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private Role role;
    private AccountStatus accountStatus;
    private LocalDateTime createdAt;

    public UserResponse() {}

    public UserResponse(Long id, String fullName, String email, String phone, Role role, AccountStatus accountStatus, LocalDateTime createdAt) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.role = role;
        this.accountStatus = accountStatus;
        this.createdAt = createdAt;
    }

    public static UserResponse fromEntity(User user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.getAccountStatus(),
                user.getCreatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public AccountStatus getAccountStatus() {
        return accountStatus;
    }

    public void setAccountStatus(AccountStatus accountStatus) {
        this.accountStatus = accountStatus;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
