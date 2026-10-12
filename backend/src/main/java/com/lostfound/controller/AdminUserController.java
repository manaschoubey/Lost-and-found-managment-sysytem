package com.lostfound.controller;

import com.lostfound.dto.ApiResponse;
import com.lostfound.model.Role;
import com.lostfound.model.User;
import com.lostfound.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<User>>> all() {
        return ResponseEntity.ok(ApiResponse.ok("Users retrieved", userService.getAllUsers()));
    }

    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<ApiResponse<User>> toggleStatus(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok("User status updated", userService.toggleStatus(id)));
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<ApiResponse<User>> updateRole(@PathVariable String id, @RequestBody Map<String, String> body) {
        String roleStr = body.get("role");
        if (roleStr == null || roleStr.isBlank()) {
            throw new RuntimeException("Role is required");
        }
        Role role = Role.valueOf(roleStr.toUpperCase());
        return ResponseEntity.ok(ApiResponse.ok("User role updated", userService.updateRole(id, role)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.ok("User deleted", null));
    }
}
