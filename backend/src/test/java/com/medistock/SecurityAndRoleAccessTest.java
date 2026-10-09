package com.medistock;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medistock.dto.auth.LoginRequest;
import com.medistock.dto.auth.LoginResponse;
import com.medistock.dto.user.UpdateProfileRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class SecurityAndRoleAccessTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String adminToken;
    private String pharmacistToken;

    @BeforeEach
    void setUp() throws Exception {
        // Obtain Admin JWT
        LoginRequest adminLogin = new LoginRequest("admin@medistock.com", "admin123");
        MvcResult adminResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLogin)))
                .andExpect(status().isOk())
                .andReturn();
        LoginResponse adminRes = objectMapper.readValue(adminResult.getResponse().getContentAsString(), LoginResponse.class);
        adminToken = adminRes.getToken();

        // Obtain Pharmacist JWT
        LoginRequest pharmLogin = new LoginRequest("pharmacist@medistock.com", "admin123");
        MvcResult pharmResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(pharmLogin)))
                .andExpect(status().isOk())
                .andReturn();
        LoginResponse pharmRes = objectMapper.readValue(pharmResult.getResponse().getContentAsString(), LoginResponse.class);
        pharmacistToken = pharmRes.getToken();
    }

    @Test
    @DisplayName("6. Access protected endpoint without token returns 401 Unauthorized")
    void testProtectedEndpointWithoutToken() throws Exception {
        mockMvc.perform(get("/api/v1/users/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    @Test
    @DisplayName("7. Access /users/me with valid Pharmacist token returns 200 OK")
    void testCurrentUserProfileWithValidToken() throws Exception {
        mockMvc.perform(get("/api/v1/users/me")
                        .header("Authorization", "Bearer " + pharmacistToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("pharmacist@medistock.com"))
                .andExpect(jsonPath("$.role").value("PHARMACIST"));
    }

    @Test
    @DisplayName("8. Access ADMIN-only endpoint (/api/v1/users) with non-admin token returns 403 Forbidden")
    void testAdminEndpointForbiddenForNonAdmin() throws Exception {
        mockMvc.perform(get("/api/v1/users")
                        .header("Authorization", "Bearer " + pharmacistToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("Forbidden"));
    }

    @Test
    @DisplayName("9. Access ADMIN-only endpoint (/api/v1/users) with Admin token returns 200 OK")
    void testAdminEndpointAllowedForAdmin() throws Exception {
        mockMvc.perform(get("/api/v1/users")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("10. Access /api/v1/users/roles with Admin token returns 200 OK and roles list")
    void testGetRolesWithAdminToken() throws Exception {
        mockMvc.perform(get("/api/v1/users/roles")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("11. Update own profile with PUT /api/v1/users/me succeeds")
    void testUpdateCurrentUserProfile() throws Exception {
        UpdateProfileRequest updateReq = new UpdateProfileRequest();
        updateReq.setName("Updated Pharmacist Name");
        updateReq.setPhone("+1 555-4321");

        mockMvc.perform(put("/api/v1/users/me")
                        .header("Authorization", "Bearer " + pharmacistToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Pharmacist Name"))
                .andExpect(jsonPath("$.phone").value("+1 555-4321"));
    }
}
