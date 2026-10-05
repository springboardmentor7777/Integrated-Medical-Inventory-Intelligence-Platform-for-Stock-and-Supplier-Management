package com.pharmacy.system.notification;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "target_role")
    private String targetRole;

    @Column(name = "type")
    private String type;

    @Column(name = "title")
    private String title;

    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    @Column(name = "channel")
    private String channel;

    @Column(name = "status")
    private String status;

    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Default constructor required by JPA
    public Notification() {
    }

    // Parameterized constructor without id and createdAt (auto-generated)
    public Notification(Long userId, String targetRole, String type, String title, String message, String channel, String status) {
        this.userId = userId;
        this.targetRole = targetRole;
        this.type = type;
        this.title = title;
        this.message = message;
        this.channel = channel;
        this.status = status;
        this.isRead = false;
        this.createdAt = LocalDateTime.now();
    }

    // Full parameterized constructor
    public Notification(Long id, Long userId, String targetRole, String type, String title, String message, String channel, String status, boolean isRead, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.targetRole = targetRole;
        this.type = type;
        this.title = title;
        this.message = message;
        this.channel = channel;
        this.status = status;
        this.isRead = isRead;
        this.createdAt = createdAt;
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getTargetRole() {
        return targetRole;
    }

    public void setTargetRole(String targetRole) {
        this.targetRole = targetRole;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getChannel() {
        return channel;
    }

    public void setChannel(String channel) {
        this.channel = channel;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean read) {
        isRead = read;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
