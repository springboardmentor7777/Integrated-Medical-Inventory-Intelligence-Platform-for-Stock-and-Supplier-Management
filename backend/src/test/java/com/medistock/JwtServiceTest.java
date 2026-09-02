package com.medistock;

import com.medistock.entity.Role;
import com.medistock.entity.User;
import com.medistock.enums.RoleName;
import com.medistock.security.CustomUserDetails;
import com.medistock.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

public class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        // 256-bit test secret
        ReflectionTestUtils.setField(jwtService, "jwtSecret", "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");
        ReflectionTestUtils.setField(jwtService, "jwtExpirationMs", 3600000L); // 1 hour
    }

    @Test
    @DisplayName("Test JWT token generation and claims extraction")
    void testTokenGenerationAndExtraction() {
        Role role = new Role(RoleName.ADMIN, "System Administrator", "Admin role");
        role.setId(1L);

        User user = new User("Dr. Sarah Jenkins", "admin@medistock.com", "encodedPass", role, "Admin", "123", "LIC-1");
        user.setId(1L);
        CustomUserDetails userDetails = new CustomUserDetails(user);

        String token = jwtService.generateToken(userDetails);

        assertNotNull(token);
        assertFalse(token.isBlank());

        String extractedUsername = jwtService.extractUsername(token);
        assertEquals("admin@medistock.com", extractedUsername);

        String extractedRole = jwtService.extractRole(token);
        assertEquals("ADMIN", extractedRole);

        assertTrue(jwtService.isTokenValid(token, userDetails));
    }

    @Test
    @DisplayName("Test invalid JWT validation returns false")
    void testInvalidTokenValidation() {
        assertFalse(jwtService.validateToken("invalid.jwt.token"));
        assertFalse(jwtService.validateToken(null));
        assertFalse(jwtService.validateToken(""));
    }

    @Test
    @DisplayName("Test token validation with null or wrong user")
    void testTokenValidationWithWrongUser() {
        Role role = new Role(RoleName.PHARMACIST, "Pharmacist", "Staff role");
        role.setId(2L);
        User wrongUser = new User("Other User", "other@medistock.com", "pass", role, "Pharmacy", "456", "LIC-2");
        wrongUser.setId(2L);
        CustomUserDetails wrongUserDetails = new CustomUserDetails(wrongUser);

        Role adminRole = new Role(RoleName.ADMIN, "System Administrator", "Admin role");
        adminRole.setId(1L);
        User user = new User("Dr. Sarah Jenkins", "admin@medistock.com", "encodedPass", adminRole, "Admin", "123", "LIC-1");
        user.setId(1L);
        CustomUserDetails userDetails = new CustomUserDetails(user);

        String token = jwtService.generateToken(userDetails);
        assertFalse(jwtService.isTokenValid(token, wrongUserDetails));
        assertFalse(jwtService.isTokenValid(null, userDetails));
        assertFalse(jwtService.isTokenValid(token, null));
    }

    @Test
    @DisplayName("Test expired token validation returns false")
    void testExpiredTokenValidation() {
        Role role = new Role(RoleName.ADMIN, "System Administrator", "Admin role");
        role.setId(1L);
        User user = new User("Dr. Sarah Jenkins", "admin@medistock.com", "encodedPass", role, "Admin", "123", "LIC-1");
        user.setId(1L);
        CustomUserDetails userDetails = new CustomUserDetails(user);

        String expiredToken = jwtService.buildToken(new java.util.HashMap<>(), userDetails.getUsername(), -1000L);
        assertFalse(jwtService.validateToken(expiredToken));
        assertFalse(jwtService.isTokenValid(expiredToken, userDetails));
    }
}
