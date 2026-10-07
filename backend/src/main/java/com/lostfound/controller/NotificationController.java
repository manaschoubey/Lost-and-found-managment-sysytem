package com.lostfound.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lostfound.dto.ApiResponse;
import com.lostfound.model.Notification;
import com.lostfound.service.NotificationService;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired private NotificationService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Notification>>> list(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok("OK", service.list(auth.getName())));
    }

    @GetMapping("/unread")
    public ResponseEntity<ApiResponse<List<Notification>>> unread(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok("OK", service.unread(auth.getName())));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> read(@PathVariable String id) {
        service.markRead(id);
        return ResponseEntity.ok(ApiResponse.ok("Marked read", null));
    }
}