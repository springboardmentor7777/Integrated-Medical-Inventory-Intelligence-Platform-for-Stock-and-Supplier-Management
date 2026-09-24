package com.medistock.service;

import com.medistock.entity.LowStockAlert;
import com.medistock.entity.Medicine;
import com.medistock.repository.LowStockAlertRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LowStockAlertService {

    private final LowStockAlertRepository lowStockAlertRepository;
    private final NotificationService notificationService;

    public LowStockAlertService(
            LowStockAlertRepository lowStockAlertRepository,
            NotificationService notificationService) {

        this.lowStockAlertRepository = lowStockAlertRepository;
        this.notificationService = notificationService;
    }

    // Check whether medicine stock is low
    public void checkLowStock(Medicine medicine) {

        Integer currentQuantity = medicine.getQuantity();
        Integer threshold = medicine.getLowStockThreshold();

        if (currentQuantity <= threshold) {

            // Create low-stock alert
            LowStockAlert alert = new LowStockAlert();

            alert.setMedicine(medicine);
            alert.setCurrentQuantity(currentQuantity);
            alert.setThreshold(threshold);
            alert.setStatus("ACTIVE");

            lowStockAlertRepository.save(alert);

            // Create notification
            notificationService.createLowStockNotification(
                    medicine,
                    currentQuantity,
                    threshold
            );
        }
    }

    // Get all active low-stock alerts
    public List<LowStockAlert> getActiveAlerts() {
        return lowStockAlertRepository.findByStatus("ACTIVE");
    }

    // Get alerts for one medicine
    public List<LowStockAlert> getAlertsByMedicine(
            Medicine medicine) {

        return lowStockAlertRepository.findByMedicine(medicine);
    }
}