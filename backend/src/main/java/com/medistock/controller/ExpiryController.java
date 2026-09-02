package com.medistock.controller;

import com.medistock.dto.common.ApiResponse;
import com.medistock.dto.medicine.MedicineResponse;
import com.medistock.service.ExpiryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/expiry")
public class ExpiryController {

    private final ExpiryService expiryService;

    public ExpiryController(ExpiryService expiryService) {
        this.expiryService = expiryService;
    }

    /** GET /api/v1/expiry/expiring — medicines with EXPIRING_SOON status */
    @GetMapping("/expiring")
    public ResponseEntity<List<MedicineResponse>> getExpiringMedicines() {
        return ResponseEntity.ok(expiryService.getExpiringMedicines());
    }

    /** GET /api/v1/expiry/expired — medicines with EXPIRED status */
    @GetMapping("/expired")
    public ResponseEntity<List<MedicineResponse>> getExpiredMedicines() {
        return ResponseEntity.ok(expiryService.getExpiredMedicines());
    }

    /** GET /api/v1/expiry/report — full expiry summary report */
    @GetMapping("/report")
    public ResponseEntity<Map<String, Object>> getExpiryReport() {
        return ResponseEntity.ok(expiryService.getExpiryReport());
    }

    /**
     * POST /api/v1/expiry/refresh
     * Manually triggers re-computation of all medicine & batch expiry statuses.
     * Only ADMIN can call this; in production this is run on a scheduler.
     */
    @PostMapping("/refresh")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> refreshExpiryStatuses() {
        int updatedCount = expiryService.refreshExpiryStatuses();
        return ResponseEntity.ok(
                ApiResponse.success("Expiry statuses refreshed successfully",
                        updatedCount + " medicine(s) updated"));
    }
}
