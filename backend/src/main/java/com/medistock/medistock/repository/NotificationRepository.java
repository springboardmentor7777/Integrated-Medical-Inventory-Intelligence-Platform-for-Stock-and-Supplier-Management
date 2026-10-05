package com.medistock.medistock.repository;

import com.medistock.medistock.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @Query("SELECT n FROM Notification n WHERE n.userId = :userId ORDER BY n.createdAt DESC")
    List<Notification> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);

    @Query("SELECT n FROM Notification n WHERE n.targetRole = :targetRole ORDER BY n.createdAt DESC")
    List<Notification> findByTargetRoleOrderByCreatedAtDesc(@Param("targetRole") String targetRole);

    @Query("SELECT n FROM Notification n WHERE " +
           "(:userId IS NOT NULL AND n.userId = :userId) OR " +
           "(:targetRole IS NOT NULL AND n.targetRole = :targetRole) " +
           "ORDER BY n.createdAt DESC")
    List<Notification> findByUserIdOrTargetRoleOrderByCreatedAtDesc(
            @Param("userId") Long userId,
            @Param("targetRole") String targetRole);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.userId = :userId AND n.isRead = false")
    long countUnreadByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.targetRole = :targetRole AND n.isRead = false")
    long countUnreadByTargetRole(@Param("targetRole") String targetRole);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.isRead = false AND (" +
           "(:userId IS NOT NULL AND n.userId = :userId) OR " +
           "(:targetRole IS NOT NULL AND n.targetRole = :targetRole))")
    long countUnreadByUserIdOrTargetRole(
            @Param("userId") Long userId,
            @Param("targetRole") String targetRole);

    List<Notification> findAllByOrderByCreatedAtDesc();
}
