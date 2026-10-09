package com.medistock;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medistock.dto.auth.LoginRequest;
import com.medistock.dto.auth.RegisterRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("1. Health Endpoint Public Access Test")
    void testHealthEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.service").value("MediStock Backend"));
    }

    @Test
    @DisplayName("2. Admin Login Success with Seeded Credentials")
    void testAdminLoginSuccess() throws Exception {
        LoginRequest loginRequest = new LoginRequest("admin@medistock.com", "admin123");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.user.email").value("admin@medistock.com"))
                .andExpect(jsonPath("$.user.role").value("ADMIN"))
                .andExpect(jsonPath("$.user.status").value("ACTIVE"))
                .andExpect(jsonPath("$.user.password").doesNotExist());
    }

    @Test
    @DisplayName("3. Login Failure with Invalid Password")
    void testLoginFailureInvalidPassword() throws Exception {
        LoginRequest loginRequest = new LoginRequest("admin@medistock.com", "wrongPassword");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    @Test
    @DisplayName("4. User Registration Success")
    void testRegisterUserSuccess() throws Exception {
        RegisterRequest registerRequest = new RegisterRequest(
                "Test Pharmacist",
                "test.pharmacist@medistock.com",
                "password123",
                "PHARMACIST",
                "Clinical Ward",
                "+1 555-9988",
                "LIC-TEST-001"
        );

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.user.email").value("test.pharmacist@medistock.com"))
                .andExpect(jsonPath("$.user.role").value("PHARMACIST"))
                .andExpect(jsonPath("$.user.password").doesNotExist());
    }

    @Test
    @DisplayName("5. Duplicate Email Registration Returns Conflict 409")
    void testDuplicateEmailRegistration() throws Exception {
        RegisterRequest registerRequest = new RegisterRequest(
                "Duplicate Admin",
                "admin@medistock.com",
                "password123",
                "PHARMACIST",
                "Clinical Ward",
                "+1 555-9988",
                "LIC-TEST-002"
        );

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("Conflict"))
                .andExpect(jsonPath("$.message", containsString("already exists")));
    }
}
