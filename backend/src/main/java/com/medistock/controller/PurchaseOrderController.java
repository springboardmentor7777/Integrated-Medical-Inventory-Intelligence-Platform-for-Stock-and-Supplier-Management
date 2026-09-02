package com.medistock.controller;

import com.medistock.dto.purchase.CreatePurchaseOrderRequest;
import com.medistock.dto.purchase.PurchaseOrderResponse;
import com.medistock.service.PurchaseOrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/purchases")
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    public PurchaseOrderController(PurchaseOrderService purchaseOrderService) {
        this.purchaseOrderService = purchaseOrderService;
    }

    /**
     * GET /api/v1/purchases?supplierId=&status=&search=
     * All authenticated users can view purchase orders
     */
    @GetMapping
    public ResponseEntity<List<PurchaseOrderResponse>> getAllOrders(
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(purchaseOrderService.getAllOrders(supplierId, status, search));
    }

    /** GET /api/v1/purchases/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<PurchaseOrderResponse> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseOrderService.getOrderById(id));
    }

    /**
     * POST /api/v1/purchases
     * Only ADMIN, INVENTORY_MANAGER, PHARMACIST can create purchase orders
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY_MANAGER','PHARMACIST')")
    public ResponseEntity<PurchaseOrderResponse> createOrder(
            @Valid @RequestBody CreatePurchaseOrderRequest request) {
        PurchaseOrderResponse response = purchaseOrderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * PUT /api/v1/purchases/{id}/status
     * Body: { "status": "APPROVED" | "SHIPPED" | "DELIVERED" | "CANCELLED" }
     * DELIVERED triggers automatic inventory restock
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY_MANAGER')")
    public ResponseEntity<PurchaseOrderResponse> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String newStatus = body.get("status");
        if (newStatus == null || newStatus.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(purchaseOrderService.updateOrderStatus(id, newStatus));
    }
}
