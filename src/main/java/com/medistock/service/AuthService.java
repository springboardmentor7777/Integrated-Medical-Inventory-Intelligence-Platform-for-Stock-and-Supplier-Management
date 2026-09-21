package com.medistock.service;

import com.medistock.dto.LoginRequest;
import com.medistock.dto.LoginResponse;
import com.medistock.dto.RegisterRequest;
import com.medistock.entity.Role;
import com.medistock.entity.User;
import com.medistock.repository.RoleRepository;
import com.medistock.repository.UserRepository;
import com.medistock.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    // REGISTER
    public String register(RegisterRequest request) {

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            return "Email already registered";
        }

        // Find selected role
        Role role = roleRepository.findByRoleName(request.getRole())
                .orElseThrow(() -> new RuntimeException("Role not found"));

        // Create new user
        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());

        // Hash password using BCrypt
        user.setPasswordHash(
                passwordEncoder.encode(request.getPassword())
        );

        user.setRole(role);

        // Save user
        userRepository.save(user);

        return "User registered successfully";
    }

    // LOGIN
    public LoginResponse login(LoginRequest request) {

        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        // Check password
        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPasswordHash()
        )) {
            throw new RuntimeException("Invalid email or password");
        }

        // Get role name
        String role = user.getRole() != null
                ? user.getRole().getRoleName()
                : null;

        // Generate JWT (now includes role)
        String token = jwtUtil.generateToken(user.getEmail(), role);

        return new LoginResponse(
                token,
                user.getName(),
                user.getEmail(),
                role
        );
    }
}