package com.medistock.controller;

import com.medistock.dto.dashboard.DashboardStatsResponse;
import com.medistock.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    /**
     * GET /api/v1/dashboard/stats
     * Returns: totalMedicines, low/out-of-stock counts, expiry counts,
     *          totalInventoryValue, categoryBreakdown, recentActivities,
     *          lowStockAlertList, expiringAlertList
     */
    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getStats() {
        return ResponseEntity.ok(dashboardService.getStats());
    }
}
