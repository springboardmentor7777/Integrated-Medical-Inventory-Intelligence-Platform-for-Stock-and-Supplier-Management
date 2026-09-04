package com.medistock;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medistock.dto.auth.LoginRequest;
import com.medistock.dto.auth.LoginResponse;
import com.medistock.dto.inventory.StockUpdateRequest;
import com.medistock.dto.purchase.CreatePurchaseOrderRequest;
import com.medistock.dto.purchase.PurchaseOrderItemRequest;
import com.medistock.dto.supplier.SupplierRequest;
import com.medistock.enums.AdjustmentReason;
import com.medistock.enums.StockMovementType;
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

import java.time.LocalDate;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class BackendPart2IntegrationTest {

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
    @DisplayName("1. Supplier CRUD operations work as expected")
    void testSupplierCrud() throws Exception {
        // Create
        SupplierRequest req = new SupplierRequest();
        req.setName("Test Pharma Supplies " + System.currentTimeMillis());
        req.setContactPerson("John Doe");
        req.setEmail("contact@testpharma.com");
        req.setPhone("+1 555-9988");
        req.setAddress("123 Med Park");
        req.setStatus("ACTIVE");

        MvcResult result = mockMvc.perform(post("/api/v1/suppliers")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.name").value(req.getName()))
                .andReturn();

        // Get All
        mockMvc.perform(get("/api/v1/suppliers")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("2. Purchase Order creation and status workflow")
    void testPurchaseOrderWorkflow() throws Exception {
        CreatePurchaseOrderRequest poReq = new CreatePurchaseOrderRequest();
        poReq.setSupplierId(1L);
        poReq.setExpectedDeliveryDate(LocalDate.now().plusDays(7));
        poReq.setNotes("Urgent replenishment batch");

        PurchaseOrderItemRequest item = new PurchaseOrderItemRequest();
        item.setMedicineId(1L);
        item.setMedicineName("Amoxicillin 500mg");
        item.setQuantity(50);
        item.setUnitPrice(12.50);
        poReq.setItems(Collections.singletonList(item));

        MvcResult poRes = mockMvc.perform(post("/api/v1/purchases")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(poReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.poNumber").exists())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andReturn();

        // Query POs
        mockMvc.perform(get("/api/v1/purchases")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("3. Inventory endpoints and stock adjustments")
    void testInventoryAndStockAdjustment() throws Exception {
        // List inventory
        mockMvc.perform(get("/api/v1/inventory")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        // Low stock query
        mockMvc.perform(get("/api/v1/inventory/low-stock")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        // Stock adjustment
        StockUpdateRequest adjReq = new StockUpdateRequest();
        adjReq.setType(StockMovementType.IN);
        adjReq.setReason(AdjustmentReason.SHIPMENT_RECEIVED);
        adjReq.setQuantity(10);
        adjReq.setNotes("Received test unit");

        mockMvc.perform(put("/api/v1/inventory/1/stock")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adjReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantity").isNumber());

        // Check history
        mockMvc.perform(get("/api/v1/inventory/history")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("4. Expiry monitoring endpoints")
    void testExpiryEndpoints() throws Exception {
        mockMvc.perform(get("/api/v1/expiry/expiring")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        mockMvc.perform(get("/api/v1/expiry/expired")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        mockMvc.perform(get("/api/v1/expiry/report")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reportDate").exists())
                .andExpect(jsonPath("$.totalMedicines").isNumber());
    }

    @Test
    @DisplayName("5. Dashboard aggregated stats endpoint")
    void testDashboardStats() throws Exception {
        mockMvc.perform(get("/api/v1/dashboard/stats")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalMedicines").isNumber())
                .andExpect(jsonPath("$.lowStockCount").isNumber())
                .andExpect(jsonPath("$.categoryBreakdown").isArray())
                .andExpect(jsonPath("$.recentActivities").isArray());
    }
}
