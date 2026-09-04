package com.medistock.controller;

import com.medistock.dto.inventory.InventoryResponse;
import com.medistock.dto.inventory.StockLogResponse;
import com.medistock.dto.inventory.StockUpdateRequest;
import com.medistock.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    /** GET /api/v1/inventory — full inventory list */
    @GetMapping
    public ResponseEntity<List<InventoryResponse>> getAllInventory() {
        return ResponseEntity.ok(inventoryService.getAllInventory());
    }

    /** GET /api/v1/inventory/low-stock */
    @GetMapping("/low-stock")
    public ResponseEntity<List<InventoryResponse>> getLowStockItems() {
        return ResponseEntity.ok(inventoryService.getLowStockItems());
    }

    /** GET /api/v1/inventory/out-of-stock */
    @GetMapping("/out-of-stock")
    public ResponseEntity<List<InventoryResponse>> getOutOfStockItems() {
        return ResponseEntity.ok(inventoryService.getOutOfStockItems());
    }

    /** GET /api/v1/inventory/history — last 50 stock log entries */
    @GetMapping("/history")
    public ResponseEntity<List<StockLogResponse>> getStockHistory() {
        return ResponseEntity.ok(inventoryService.getStockHistory());
    }

    /** GET /api/v1/inventory/history/{medicineId} — stock history for one medicine */
    @GetMapping("/history/{medicineId}")
    public ResponseEntity<List<StockLogResponse>> getStockHistoryByMedicine(@PathVariable Long medicineId) {
        return ResponseEntity.ok(inventoryService.getStockHistoryByMedicine(medicineId));
    }

    /**
     * PUT /api/v1/inventory/{medicineId}/stock
     * Adjust stock quantity (IN or OUT).
     * Roles: ADMIN, INVENTORY_MANAGER, PHARMACIST
     */
    @PutMapping("/{medicineId}/stock")
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY_MANAGER','PHARMACIST')")
    public ResponseEntity<InventoryResponse> updateStock(
            @PathVariable Long medicineId,
            @Valid @RequestBody StockUpdateRequest request) {
        return ResponseEntity.ok(inventoryService.updateStock(medicineId, request));
    }
}
