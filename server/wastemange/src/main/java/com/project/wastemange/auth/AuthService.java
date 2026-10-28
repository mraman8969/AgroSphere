package com.project.wastemange.auth;

import com.project.wastemange.auth.dto.AuthResponse;
import com.project.wastemange.auth.dto.LoginRequest;
import com.project.wastemange.auth.dto.RegisterRequest;
import com.project.wastemange.buyer.BuyerProfileService;
import com.project.wastemange.common.BadRequestException;
import com.project.wastemange.common.ConflictException;
import com.project.wastemange.config.JwtTokenProvider;
import com.project.wastemange.config.UserPrincipal;
import com.project.wastemange.farmer.FarmerProfileService;
import com.project.wastemange.user.AccountStatus;
import com.project.wastemange.user.Role;
import com.project.wastemange.user.User;
import com.project.wastemange.user.UserRepository;
import com.project.wastemange.user.dto.UserResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final FarmerProfileService farmerProfileService;
    private final BuyerProfileService buyerProfileService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider,
                       FarmerProfileService farmerProfileService,
                       BuyerProfileService buyerProfileService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.farmerProfileService = farmerProfileService;
        this.buyerProfileService = buyerProfileService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Enforce user role restrictions: SUPPLIER is exclusively for Farmers
        if (request.getRole() == Role.ADMIN) {
            throw new BadRequestException("Self-registration as ADMIN is not permitted");
        }

        if (request.getRole() != Role.SUPPLIER && request.getRole() != Role.BUYER) {
            throw new BadRequestException("Invalid role. Role must be SUPPLIER (Farmer) or BUYER (Recycler)");
        }

        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("Email is already registered: " + email);
        }

        if (request.getPhone() != null && !request.getPhone().trim().isEmpty()) {
            String phone = request.getPhone().trim();
            if (userRepository.existsByPhone(phone)) {
                throw new ConflictException("Phone number is already registered: " + phone);
            }
        }

        User user = new User();
        user.setFullName(request.getFullName().trim());
        user.setEmail(email);
        user.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setAccountStatus(AccountStatus.ACTIVE);

        User savedUser = userRepository.save(user);

        // Automatically initialize profile according to role
        if (savedUser.getRole() == Role.SUPPLIER) {
            farmerProfileService.createInitialProfile(savedUser);
            log.info("Initialized FarmerProfile for farmer: {}", savedUser.getEmail());
        } else if (savedUser.getRole() == Role.BUYER) {
            buyerProfileService.createInitialProfile(savedUser);
            log.info("Initialized BuyerProfile for buyer: {}", savedUser.getEmail());
        }

        UserPrincipal principal = UserPrincipal.create(savedUser);
        String token = tokenProvider.generateToken(principal);

        return new AuthResponse(token, tokenProvider.getExpirationMs() / 1000, UserResponse.fromEntity(savedUser));
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        String token = tokenProvider.generateToken(principal);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));

        return new AuthResponse(token, tokenProvider.getExpirationMs() / 1000, UserResponse.fromEntity(user));
    }
}
