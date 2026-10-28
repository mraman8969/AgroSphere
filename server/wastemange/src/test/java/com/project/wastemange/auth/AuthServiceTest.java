package com.project.wastemange.auth;

import com.project.wastemange.auth.dto.AuthResponse;
import com.project.wastemange.auth.dto.RegisterRequest;
import com.project.wastemange.buyer.BuyerProfileService;
import com.project.wastemange.common.BadRequestException;
import com.project.wastemange.common.ConflictException;
import com.project.wastemange.config.JwtTokenProvider;
import com.project.wastemange.farmer.FarmerProfileService;
import com.project.wastemange.user.Role;
import com.project.wastemange.user.User;
import com.project.wastemange.user.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    private JwtTokenProvider tokenProvider;

    @Mock
    private com.project.wastemange.farmer.FarmerProfileRepository farmerProfileRepository;

    @Mock
    private com.project.wastemange.buyer.BuyerProfileRepository buyerProfileRepository;

    private FarmerProfileService farmerProfileService;
    private BuyerProfileService buyerProfileService;
    private AuthService authService;

    @org.junit.jupiter.api.BeforeEach
    void setUp() {
        tokenProvider = new JwtTokenProvider("9a4f2c8d3b7a1e6f4c5d8e0a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c", 86400000L);
        farmerProfileService = new FarmerProfileService(farmerProfileRepository, userRepository);
        buyerProfileService = new BuyerProfileService(buyerProfileRepository, userRepository);
        authService = new AuthService(userRepository, passwordEncoder, authenticationManager, tokenProvider, farmerProfileService, buyerProfileService);
    }

    @Test
    @DisplayName("Should successfully register a farmer as SUPPLIER and initialize FarmerProfile")
    void testRegisterFarmer() {
        RegisterRequest request = new RegisterRequest("Kisan Lal", "kisan@krishi.com", "9811223344", "secret123", Role.SUPPLIER);

        when(userRepository.existsByEmail("kisan@krishi.com")).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("encoded_pass");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(50L);
            return u;
        });
        when(farmerProfileRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertNotNull(response.getToken());
        assertTrue(response.getToken().length() > 20);
        assertEquals("kisan@krishi.com", response.getUser().getEmail());
        assertEquals(Role.SUPPLIER, response.getUser().getRole());

        verify(farmerProfileRepository).save(any());
        verify(buyerProfileRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should reject registration if role is ADMIN")
    void testDisallowAdminSelfRegistration() {
        RegisterRequest request = new RegisterRequest("Admin User", "admin@site.com", null, "secret123", Role.ADMIN);

        assertThrows(BadRequestException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw ConflictException on duplicate email")
    void testDuplicateEmail() {
        RegisterRequest request = new RegisterRequest("Existing User", "duplicate@test.com", null, "secret123", Role.BUYER);
        when(userRepository.existsByEmail("duplicate@test.com")).thenReturn(true);

        assertThrows(ConflictException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any());
    }
}
