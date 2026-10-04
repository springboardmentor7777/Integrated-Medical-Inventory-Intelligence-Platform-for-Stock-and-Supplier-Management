package com.pharmacy.system.controller;

import com.pharmacy.system.notification.Notification;
import com.pharmacy.system.notification.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    @Autowired
    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /**
     * GET /api/notifications
     * Retrieve notifications filtered by userId, targetRole, or all if no filters provided.
     */
    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String targetRole) {
        List<Notification> notifications = notificationService.getNotifications(userId, targetRole);
        return ResponseEntity.ok(notifications);
    }

    /**
     * GET /api/notifications/unread-count
     * Retrieve count of unread notifications for UI badge counters.
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Object>> getUnreadCount(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String targetRole) {
        long count = notificationService.getUnreadCount(userId, targetRole);
        Map<String, Object> response = new HashMap<>();
        response.put("unreadCount", count);
        if (userId != null) {
            response.put("userId", userId);
        }
        if (targetRole != null) {
            response.put("targetRole", targetRole);
        }
        return ResponseEntity.ok(response);
    }

    /**
     * PATCH /api/notifications/{id}/read
     * Mark an individual notification as read.
     */
    @PatchMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id) {
        Notification updated = notificationService.markAsRead(id);
        return ResponseEntity.ok(updated);
    }

    /**
     * POST /api/notifications
     * Optional endpoint to create custom notification records.
     */
    @PostMapping
    public ResponseEntity<Notification> createNotification(@RequestBody Notification notification) {
        Notification saved = notificationService.saveNotification(notification);
        return ResponseEntity.ok(saved);
    }
}
