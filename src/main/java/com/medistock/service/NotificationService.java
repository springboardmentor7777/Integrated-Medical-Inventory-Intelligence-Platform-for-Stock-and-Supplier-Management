package com.medistock.service;

import com.medistock.entity.Medicine;
import com.medistock.entity.Notification;
import com.medistock.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    // Create a low-stock notification
    public Notification createLowStockNotification(
            Medicine medicine,
            Integer currentQuantity,
            Integer threshold) {

        Notification notification = new Notification();

        notification.setMessage(
                medicine.getMedicineName()
                        + " stock is low. Current stock: "
                        + currentQuantity
                        + ", threshold: "
                        + threshold
        );

        notification.setType("LOW_STOCK");
        notification.setRead(false);
        notification.setMedicine(medicine);

        return notificationRepository.save(notification);
    }

    // Get all notifications
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    // Get unread notifications
    public List<Notification> getUnreadNotifications() {
        return notificationRepository.findByReadFalse();
    }

    // Mark notification as read
    public Notification markAsRead(Integer notificationId) {

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Notification not found with id: "
                                        + notificationId));

        notification.setRead(true);

        return notificationRepository.save(notification);
    }
}