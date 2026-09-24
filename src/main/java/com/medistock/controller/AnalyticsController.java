
        package com.medistock.controller;

import com.medistock.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    // Get total number of medicines
    @GetMapping("/total-medicines")
    public ResponseEntity<Long> getTotalMedicines() {
        return ResponseEntity.ok(
                analyticsService.getTotalMedicines()
        );
    }

    // Get total stock units
    @GetMapping("/total-stock")
    public ResponseEntity<Long> getTotalStock() {
        return ResponseEntity.ok(
                analyticsService.getTotalStock()
        );
    }

    // Get number of low-stock medicines
    @GetMapping("/low-stock")
    public ResponseEntity<Long> getLowStockCount() {
        return ResponseEntity.ok(
                analyticsService.getLowStockCount()
        );
    }

    // Get number of expired medicines
    @GetMapping("/expired")
    public ResponseEntity<Long> getExpiredCount() {
        return ResponseEntity.ok(
                analyticsService.getExpiredCount()
        );
    }

    // Get number of medicines expiring within 30 days
    @GetMapping("/expiring-soon")
    public ResponseEntity<Long> getExpiringSoonCount() {
        return ResponseEntity.ok(
                analyticsService.getExpiringSoonCount()
        );
    }

    // Get complete analytics summary
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Long>> getAnalyticsSummary() {
        return ResponseEntity.ok(
                analyticsService.getAnalyticsSummary()
        );
    }
}

