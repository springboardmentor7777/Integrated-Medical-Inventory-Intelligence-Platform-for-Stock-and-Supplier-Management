package com.pharmacy.system;

import com.pharmacy.system.notification.Notification;
import com.pharmacy.system.notification.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class NotificationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private NotificationRepository notificationRepository;

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();
    }

    @Test
    void testGetNotificationsAndMarkAsRead() throws Exception {
        Notification notification = new Notification(
                101L,
                "PHARMACIST",
                "LOW_STOCK",
                "Low Stock: Amoxicillin",
                "Remaining: 5",
                "IN_APP",
                "SENT"
        );
        Notification saved = notificationRepository.save(notification);

        // 1. Verify GET /api/notifications
        mockMvc.perform(get("/api/notifications")
                        .param("userId", "101"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title", is("Low Stock: Amoxicillin")))
                .andExpect(jsonPath("$[0].read", is(false)));

        // 2. Verify GET /api/notifications/unread-count
        mockMvc.perform(get("/api/notifications/unread-count")
                        .param("userId", "101"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unreadCount", is(1)))
                .andExpect(jsonPath("$.userId", is(101)));

        // 3. Verify PATCH /api/notifications/{id}/read
        mockMvc.perform(patch("/api/notifications/" + saved.getId() + "/read"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.read", is(true)));

        // 4. Verify unread-count updated to 0
        mockMvc.perform(get("/api/notifications/unread-count")
                        .param("userId", "101"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unreadCount", is(0)));
    }
}
