package com.medistock.service;

import com.medistock.dto.user.CreateUserRequest;
import com.medistock.dto.user.UpdateProfileRequest;
import com.medistock.dto.user.UpdateUserRequest;
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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new UnauthorizedException("User is not authenticated");
        }

        String email = authentication.getName();
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found with email: " + email));
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUserProfile() {
        User currentUser = getCurrentAuthenticatedUser();
        return UserResponse.fromEntity(currentUser);
    }

    @Transactional
    public UserResponse updateCurrentUserProfile(UpdateProfileRequest request) {
        User currentUser = getCurrentAuthenticatedUser();

        if (request.getName() != null && !request.getName().isBlank()) {
            currentUser.setName(request.getName().trim());
        }
        if (request.getPhone() != null) {
            currentUser.setPhone(request.getPhone().trim());
        }
        if (request.getDepartment() != null) {
            currentUser.setDepartment(request.getDepartment().trim());
        }
        if (request.getLicenseNumber() != null) {
            currentUser.setLicenseNumber(request.getLicenseNumber().trim());
        }
        if (request.getBio() != null) {
            currentUser.setBio(request.getBio().trim());
        }
        if (request.getAvatarStyle() != null) {
            currentUser.setAvatarStyle(request.getAvatarStyle().trim());
        }
        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            if (request.getNewPassword().length() < 6) {
                throw new BadRequestException("Password must be at least 6 characters");
            }
            currentUser.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }

        User saved = userRepository.save(currentUser);
        return UserResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return UserResponse.fromEntity(user);
    }

    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new DuplicateResourceException("An account with email " + email + " already exists");
        }

        RoleName roleName;
        try {
            roleName = RoleName.valueOf(request.getRole().toUpperCase());
        } catch (Exception e) {
            throw new BadRequestException("Invalid role: " + request.getRole());
        }

        final RoleName targetRoleName = roleName;
        Role role = roleRepository.findByName(targetRoleName)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + targetRoleName));

        User user = new User(
                request.getName().trim(),
                email,
                passwordEncoder.encode(request.getPassword()),
                role,
                request.getDepartment() != null ? request.getDepartment().trim() : "General Department",
                request.getPhone() != null ? request.getPhone().trim() : "",
                request.getLicenseNumber() != null ? request.getLicenseNumber().trim() : "");

        if (request.getStatus() != null) {
            try {
                user.setStatus(UserStatus.valueOf(request.getStatus().toUpperCase()));
            } catch (Exception ignored) {
                user.setStatus(UserStatus.ACTIVE);
            }
        }

        User saved = userRepository.save(user);
        return UserResponse.fromEntity(saved);
    }

    @Transactional
    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName().trim());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            String newEmail = request.getEmail().trim().toLowerCase();
            if (!newEmail.equalsIgnoreCase(user.getEmail())) {
                if (userRepository.existsByEmailIgnoreCase(newEmail)) {
                    throw new DuplicateResourceException("An account with email " + newEmail + " already exists");
                }
                user.setEmail(newEmail);
            }
        }
        if (request.getRole() != null && !request.getRole().isBlank()) {
            RoleName roleName;
            try {
                roleName = RoleName.valueOf(request.getRole().toUpperCase());
            } catch (Exception e) {
                throw new BadRequestException("Invalid role: " + request.getRole());
            }
            final RoleName targetRoleName = roleName;
            Role role = roleRepository.findByName(targetRoleName)
                    .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + targetRoleName));
            user.setRole(role);
        }
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            try {
                user.setStatus(UserStatus.valueOf(request.getStatus().toUpperCase()));
            } catch (Exception e) {
                throw new BadRequestException("Invalid status: " + request.getStatus());
            }
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }
        if (request.getDepartment() != null) {
            user.setDepartment(request.getDepartment().trim());
        }
        if (request.getLicenseNumber() != null) {
            user.setLicenseNumber(request.getLicenseNumber().trim());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio().trim());
        }
        if (request.getAvatarStyle() != null) {
            user.setAvatarStyle(request.getAvatarStyle().trim());
        }
        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            if (request.getNewPassword().length() < 6) {
                throw new BadRequestException("Password must be at least 6 characters");
            }
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }

        User saved = userRepository.save(user);
        return UserResponse.fromEntity(saved);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        // Prevent deleting the primary admin account
        if ("admin@medistock.com".equalsIgnoreCase(user.getEmail())) {
            throw new BadRequestException("Primary administrator account cannot be deleted");
        }

        userRepository.delete(user);
    }
}
