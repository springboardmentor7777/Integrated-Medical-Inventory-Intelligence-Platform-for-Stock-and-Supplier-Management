package com.medistock.service;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Real-time notification service using WebSocket STOMP.
 * Broadcasts events to all connected clients on specific topics:
 *   /topic/inventory  — stock changes, new medicines
 *   /topic/alerts     — low-stock, out-of-stock, expiry warnings
 *   /topic/suppliers  — supplier CRUD, purchase order updates
 *   /topic/users      — user management events
 *   /topic/dashboard  — aggregated stat refresh signals
 */
@Service
public class RealtimeNotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public RealtimeNotificationService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Broadcast an inventory change event.
     */
    public void notifyInventoryUpdate(String action, Long medicineId, String medicineName, Object payload) {
        Map<String, Object> event = buildEvent("INVENTORY", action, payload);
        event.put("medicineId", medicineId);
        event.put("medicineName", medicineName);
        messagingTemplate.convertAndSend("/topic/inventory", event);
        // Also signal dashboard refresh
        messagingTemplate.convertAndSend("/topic/dashboard", buildEvent("DASHBOARD", "REFRESH", null));
    }

    /**
     * Broadcast a stock alert event (low stock, out of stock, expiry).
     */
    public void notifyStockAlert(String alertType, Long medicineId, String medicineName, String details) {
        Map<String, Object> event = buildEvent("ALERT", alertType, null);
        event.put("medicineId", medicineId);
        event.put("medicineName", medicineName);
        event.put("details", details);
        messagingTemplate.convertAndSend("/topic/alerts", event);
    }

    /**
     * Broadcast a supplier-related event.
     */
    public void notifySupplierUpdate(String action, Long supplierId, String supplierName, Object payload) {
        Map<String, Object> event = buildEvent("SUPPLIER", action, payload);
        event.put("supplierId", supplierId);
        event.put("supplierName", supplierName);
        messagingTemplate.convertAndSend("/topic/suppliers", event);
    }

    /**
     * Broadcast a purchase order event.
     */
    public void notifyPurchaseOrderUpdate(String action, Long orderId, String poNumber, String status) {
        Map<String, Object> event = buildEvent("PURCHASE_ORDER", action, null);
        event.put("orderId", orderId);
        event.put("poNumber", poNumber);
        event.put("status", status);
        messagingTemplate.convertAndSend("/topic/suppliers", event);
        // Delivered orders affect inventory
        if ("DELIVERED".equals(status)) {
            messagingTemplate.convertAndSend("/topic/inventory",
                    buildEvent("INVENTORY", "RESTOCK_DELIVERED", null));
            messagingTemplate.convertAndSend("/topic/dashboard",
                    buildEvent("DASHBOARD", "REFRESH", null));
        }
    }

    /**
     * Broadcast a user management event.
     */
    public void notifyUserUpdate(String action, Long userId, String userName) {
        Map<String, Object> event = buildEvent("USER", action, null);
        event.put("userId", userId);
        event.put("userName", userName);
        messagingTemplate.convertAndSend("/topic/users", event);
    }

    private Map<String, Object> buildEvent(String category, String action, Object payload) {
        Map<String, Object> event = new HashMap<>();
        event.put("category", category);
        event.put("action", action);
        event.put("timestamp", LocalDateTime.now().toString());
        if (payload != null) {
            event.put("data", payload);
        }
        return event;
    }
}
