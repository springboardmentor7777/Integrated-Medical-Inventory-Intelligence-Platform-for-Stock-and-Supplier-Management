package com.pharmacy.system.notification;

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

    /**
     * Retrieve notifications for a specific user, role, or both, ordered by createdAt DESC.
     */
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

    /**
     * Get unread notification count for UI badge counters.
     */
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

    /**
     * Create and persist an automated low-stock alert notification.
     */
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

    /**
     * Create and persist an automated medicine expiry alert notification.
     */
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

    /**
     * Mark an existing notification as read.
     */
    public Notification markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found with ID: " + id));
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    /**
     * Create or persist a generic notification.
     */
    public Notification saveNotification(Notification notification) {
        if (notification.getCreatedAt() == null) {
            notification.setCreatedAt(LocalDateTime.now());
        }
        return notificationRepository.save(notification);
    }
}
