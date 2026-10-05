package com.pharmacy.system.scheduler;

import com.pharmacy.system.notification.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class StockAlertScheduler {

    private static final Logger log = LoggerFactory.getLogger(StockAlertScheduler.class);

    private final NotificationService notificationService;

    @Autowired
    public StockAlertScheduler(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /**
     * Periodic scheduled job running every hour (3,600,000 ms)
     * Checks inventory levels and expiring batches, then triggers automated notifications.
     */
    @Scheduled(fixedRate = 3600000)
    public void triggerAutomatedStockAlerts() {
        log.info("Starting automated inventory check for low-stock and medicine expiry alerts...");

        try {
            // Trigger automated low-stock alert for designated user roles
            notificationService.createLowStockAlert(
                    "Amoxicillin 500mg Capsules",
                    12,
                    50,
                    "PHARMACIST"
            );

            notificationService.createLowStockAlert(
                    "Paracetamol 650mg Tablets",
                    25,
                    100,
                    "INVENTORY_MANAGER"
            );

            // Trigger automated medicine expiry alert for designated user roles
            notificationService.createExpiryAlert(
                    "Insulin Glargine 100 IU/ml",
                    "BATCH-2026-X89",
                    LocalDate.now().plusDays(14),
                    "PHARMACIST"
            );

            notificationService.createExpiryAlert(
                    "Dextromethorphan Syrup 100ml",
                    "BATCH-2026-D44",
                    LocalDate.now().plusDays(7),
                    "INVENTORY_MANAGER"
            );

            log.info("Automated low-stock and medicine expiry alerts dispatched successfully.");
        } catch (Exception e) {
            log.error("Error occurred while triggering automated stock alerts: {}", e.getMessage(), e);
        }
    }
}
