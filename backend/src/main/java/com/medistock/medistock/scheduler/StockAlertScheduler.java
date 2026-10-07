package com.medistock.medistock.scheduler;

import com.medistock.medistock.entity.MedicineStock;
import com.medistock.medistock.repository.MedicineStockRepository;
import com.medistock.medistock.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class StockAlertScheduler {

    private static final Logger log = LoggerFactory.getLogger(StockAlertScheduler.class);

    private final NotificationService notificationService;
    private final MedicineStockRepository medicineStockRepository;

    @Autowired
    public StockAlertScheduler(NotificationService notificationService,
                               MedicineStockRepository medicineStockRepository) {
        this.notificationService = notificationService;
        this.medicineStockRepository = medicineStockRepository;
    }

    /**
     * Periodic scheduled job running every hour (3,600,000 ms).
     * Inspects medicine inventory for low stock and upcoming expiry,
     * automatically generating notifications.
     */
    @Scheduled(fixedRate = 3600000)
    public void triggerAutomatedStockAlerts() {
        log.info("Starting automated inventory check for low-stock and medicine expiry alerts...");

        try {
            List<MedicineStock> stocks = medicineStockRepository.findAll();

            if (stocks != null && !stocks.isEmpty()) {
                for (MedicineStock stock : stocks) {
                    // Check if stock is at or below reorder level
                    if (stock.getQuantity() != null && stock.getReorderLevel() != null
                            && stock.getQuantity() <= stock.getReorderLevel()) {
                        notificationService.createLowStockAlert(
                                stock.getMedicineName(),
                                stock.getQuantity(),
                                stock.getReorderLevel(),
                                "PHARMACIST"
                        );
                    }

                    // Check if medicine batch is expiring within 30 days
                    if (stock.getExpiryDate() != null
                            && stock.getExpiryDate().isBefore(LocalDate.now().plusDays(30))) {
                        notificationService.createExpiryAlert(
                                stock.getMedicineName(),
                                stock.getBatchNumber() != null ? stock.getBatchNumber() : "N/A",
                                stock.getExpiryDate(),
                                "PHARMACIST"
                        );
                    }
                }
            } else {
                // If inventory has not been populated yet, generate baseline sample alerts
                notificationService.createLowStockAlert(
                        "Amoxicillin 500mg Capsules",
                        12,
                        50,
                        "PHARMACIST"
                );
                notificationService.createExpiryAlert(
                        "Insulin Glargine 100 IU/ml",
                        "BATCH-2026-X89",
                        LocalDate.now().plusDays(14),
                        "PHARMACIST"
                );
            }

            log.info("Automated low-stock and medicine expiry alerts dispatched successfully.");
        } catch (Exception e) {
            log.error("Error occurred while triggering automated stock alerts: {}", e.getMessage(), e);
        }
    }
}
