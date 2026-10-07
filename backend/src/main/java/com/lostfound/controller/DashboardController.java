package com.lostfound.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lostfound.dto.ApiResponse;
import com.lostfound.service.DashboardService;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired private DashboardService service;

    @GetMapping("/user")
    public ResponseEntity<ApiResponse<Map<String, Object>>> user(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok("OK", service.userStats(auth.getName())));
    }

    @GetMapping("/admin")
    public ResponseEntity<ApiResponse<Map<String, Object>>> admin() {
        return ResponseEntity.ok(ApiResponse.ok("OK", service.adminAnalytics()));
    }
}