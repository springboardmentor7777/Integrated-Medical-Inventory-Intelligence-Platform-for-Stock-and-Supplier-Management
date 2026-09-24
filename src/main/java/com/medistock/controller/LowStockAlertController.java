package com.medistock.controller;

import com.medistock.entity.LowStockAlert;
import com.medistock.entity.Medicine;
import com.medistock.repository.MedicineRepository;
import com.medistock.service.LowStockAlertService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
public class LowStockAlertController {

    private final LowStockAlertService lowStockAlertService;
    private final MedicineRepository medicineRepository;

    public LowStockAlertController(
            LowStockAlertService lowStockAlertService,
            MedicineRepository medicineRepository) {

        this.lowStockAlertService = lowStockAlertService;
        this.medicineRepository = medicineRepository;
    }

    // Get all active low-stock alerts
    @GetMapping("/low-stock")
    public ResponseEntity<List<LowStockAlert>> getActiveAlerts() {

        return ResponseEntity.ok(
                lowStockAlertService.getActiveAlerts()
        );
    }

    // Get low-stock alerts for one medicine
    @GetMapping("/low-stock/medicine/{medicineId}")
    public ResponseEntity<List<LowStockAlert>> getAlertsByMedicine(
            @PathVariable Integer medicineId) {

        Medicine medicine = medicineRepository.findById(medicineId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Medicine not found with id: " + medicineId));

        return ResponseEntity.ok(
                lowStockAlertService.getAlertsByMedicine(medicine)
        );
    }
}