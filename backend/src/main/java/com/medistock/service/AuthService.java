package com.medistock.service;

import com.medistock.dto.auth.LoginRequest;
import com.medistock.dto.auth.LoginResponse;
import com.medistock.dto.auth.RegisterRequest;
import com.medistock.dto.user.UserResponse;
import com.medistock.entity.Role;
import com.medistock.entity.User;
import com.medistock.enums.RoleName;
import com.medistock.enums.UserStatus;
import com.medistock.exception.BadRequestException;
import com.medistock.exception.DuplicateResourceException;
import com.medistock.exception.ResourceNotFoundException;
import com.medistock.exception.UnauthorizedException;
import com.medistock.repository.RoleRepository;
import com.medistock.repository.UserRepository;
import com.medistock.security.CustomUserDetails;
import com.medistock.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        // Authenticate credentials using Spring Security AuthenticationManager
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userDetails.getUser();

        if (user.getStatus() == UserStatus.SUSPENDED) {
            throw new UnauthorizedException("User account is suspended. Please contact administrator.");
        }

        // Record last login timestamp
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        // Generate JWT token
        String jwtToken = jwtService.generateToken(userDetails);

        return new LoginResponse(jwtToken, UserResponse.fromEntity(user));
    }

    @Transactional
    public LoginResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new DuplicateResourceException("An account with email " + email + " already exists");
        }

        // Determine role (default to PHARMACIST if not provided; restrict ADMIN registration)
        RoleName roleName = RoleName.PHARMACIST;
        if (request.getRole() != null && !request.getRole().isBlank()) {
            try {
                RoleName requested = RoleName.valueOf(request.getRole().toUpperCase());
                if (requested == RoleName.ADMIN) {
                    throw new BadRequestException("ADMIN role cannot be created via public registration");
                }
                roleName = requested;
            } catch (IllegalArgumentException e) {
                roleName = RoleName.PHARMACIST;
            }
        }

        final RoleName targetRoleName = roleName;
        Role role = roleRepository.findByName(targetRoleName)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + targetRoleName));

        // Create new user with BCrypt hashed password
        User newUser = new User(
                request.getName().trim(),
                email,
                passwordEncoder.encode(request.getPassword()),
                role,
                request.getDepartment() != null ? request.getDepartment().trim() : "General Pharmacy",
                request.getPhone() != null ? request.getPhone().trim() : "",
                request.getLicenseNumber() != null ? request.getLicenseNumber().trim() : ""
        );
        newUser.setStatus(UserStatus.ACTIVE);
        newUser.setAvatarStyle("pharmD");

        User savedUser = userRepository.save(newUser);
        CustomUserDetails userDetails = new CustomUserDetails(savedUser);
        String jwtToken = jwtService.generateToken(userDetails);

        return new LoginResponse(jwtToken, UserResponse.fromEntity(savedUser));
    }

    @Transactional(readOnly = true)
    public User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new UnauthorizedException("User is not authenticated");
        }

        String email = authentication.getName();
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }
}
