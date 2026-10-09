package com.medistock;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medistock.dto.auth.LoginRequest;
import com.medistock.dto.auth.LoginResponse;
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

import java.util.HashMap;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MedicineApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String adminToken;

    @BeforeEach
    void setUp() throws Exception {
        LoginRequest adminLogin = new LoginRequest("admin@medistock.com", "admin123");
        MvcResult adminResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLogin)))
                .andExpect(status().isOk())
                .andReturn();

        LoginResponse adminRes = objectMapper.readValue(adminResult.getResponse().getContentAsString(), LoginResponse.class);
        adminToken = adminRes.getToken();
    }

    @Test
    @DisplayName("Medicine catalog CRUD and search endpoints work")
    void medicineCrudAndSearch() throws Exception {
        Map<String, Object> payload = new HashMap<>();
        payload.put("name", "Test Amoxicillin Plus");
        payload.put("code", "MED-TEST-001");
        payload.put("categoryId", 1L);
        payload.put("supplierId", 1L);
        payload.put("dosageForm", "Capsules");
        payload.put("storageCondition", "Room Temperature (15-25°C)");
        payload.put("description", "Created during integration testing");
        payload.put("unitPrice", 18.25);
        payload.put("reorderLevel", 15);
        payload.put("totalQuantity", 120);
        payload.put("stockStatus", "IN_STOCK");
        payload.put("expiryStatus", "VALID");
        payload.put("nearestExpiryDate", "2028-01-15");

        mockMvc.perform(post("/api/v1/medicines")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.name").value("Test Amoxicillin Plus"));

        mockMvc.perform(get("/api/v1/medicines")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        mockMvc.perform(get("/api/v1/medicines/search")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("query", "Test Amoxicillin"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Test Amoxicillin Plus"));
    }
}
