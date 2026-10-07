package com.medistock.medistock.controller;

import com.medistock.medistock.entity.Notification;
import com.medistock.medistock.service.NotificationService;
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

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String targetRole) {
        List<Notification> notifications = notificationService.getNotifications(userId, targetRole);
        return ResponseEntity.ok(notifications);
    }

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

    @PatchMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id) {
        Notification updated = notificationService.markAsRead(id);
        return ResponseEntity.ok(updated);
    }

    @PostMapping
    public ResponseEntity<Notification> createNotification(@RequestBody Notification notification) {
        Notification saved = notificationService.saveNotification(notification);
        return ResponseEntity.ok(saved);
    }
}
