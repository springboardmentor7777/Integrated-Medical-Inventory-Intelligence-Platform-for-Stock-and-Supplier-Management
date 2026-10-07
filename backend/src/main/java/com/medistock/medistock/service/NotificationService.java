package com.medistock.medistock.service;

import com.medistock.medistock.entity.Notification;
import com.medistock.medistock.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Autowired
    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional(readOnly = true)
    public List<Notification> getNotifications(Long userId, String targetRole) {
        if (userId != null && targetRole != null) {
            return notificationRepository.findByUserIdOrTargetRoleOrderByCreatedAtDesc(userId, targetRole);
        } else if (userId != null) {
            return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        } else if (targetRole != null) {
            return notificationRepository.findByTargetRoleOrderByCreatedAtDesc(targetRole);
        } else {
            return notificationRepository.findAllByOrderByCreatedAtDesc();
        }
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId, String targetRole) {
        if (userId != null && targetRole != null) {
            return notificationRepository.countUnreadByUserIdOrTargetRole(userId, targetRole);
        } else if (userId != null) {
            return notificationRepository.countUnreadByUserId(userId);
        } else if (targetRole != null) {
            return notificationRepository.countUnreadByTargetRole(targetRole);
        } else {
            return notificationRepository.findAllByOrderByCreatedAtDesc()
                    .stream()
                    .filter(n -> !n.isRead())
                    .count();
        }
    }

    public Notification createLowStockAlert(String medicineName, int currentStock, int threshold, String targetRole) {
        String role = (targetRole != null && !targetRole.trim().isEmpty()) ? targetRole : "PHARMACIST";
        Notification notification = new Notification();
        notification.setTargetRole(role);
        notification.setType("LOW_STOCK");
        notification.setTitle("Low Stock Alert: " + medicineName);
        notification.setMessage(String.format("Current inventory for '%s' is at %d units, below the minimum threshold of %d units. Please reorder promptly.",
                medicineName, currentStock, threshold));
        notification.setChannel("IN_APP");
        notification.setStatus("SENT");
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        return notificationRepository.save(notification);
    }

    public Notification createExpiryAlert(String medicineName, String batchNumber, LocalDate expiryDate, String targetRole) {
        String role = (targetRole != null && !targetRole.trim().isEmpty()) ? targetRole : "PHARMACIST";
        Notification notification = new Notification();
        notification.setTargetRole(role);
        notification.setType("EXPIRY_ALERT");
        notification.setTitle("Medicine Expiry Warning: " + medicineName);
        notification.setMessage(String.format("Batch '%s' of '%s' is due to expire on %s. Please review and segregate this batch.",
                batchNumber, medicineName, expiryDate));
        notification.setChannel("IN_APP");
        notification.setStatus("SENT");
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        return notificationRepository.save(notification);
    }

    public Notification markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found with ID: " + id));
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    public Notification saveNotification(Notification notification) {
        if (notification.getCreatedAt() == null) {
            notification.setCreatedAt(LocalDateTime.now());
        }
        return notificationRepository.save(notification);
    }
}
