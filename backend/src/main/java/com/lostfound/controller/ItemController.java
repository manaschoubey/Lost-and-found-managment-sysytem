package com.lostfound.controller;

import com.lostfound.dto.ApiResponse;
import com.lostfound.dto.ItemRequest;
import com.lostfound.dto.TimelineEvent;
import com.lostfound.model.FoundItem;
import com.lostfound.model.LostItem;
import com.lostfound.service.ItemService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/items")
public class ItemController {

    @Autowired
    private ItemService itemService;

    // ================= LOST =================

    @PostMapping(value = "/lost", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<LostItem>> createLost(
            @RequestPart("data") @Valid ItemRequest req,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok("Lost report created",
                itemService.createLost(auth.getName(), req, images)));
    }

    @GetMapping("/lost")
    public ResponseEntity<ApiResponse<Page<LostItem>>> listLost(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String categoryId) {
        return ResponseEntity.ok(ApiResponse.ok("OK",
                itemService.listLost(page, size, keyword, categoryId)));
    }

    @GetMapping("/lost/{id}")
    public ResponseEntity<ApiResponse<LostItem>> getLost(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok("OK", itemService.getLost(id)));
    }

    @DeleteMapping("/lost/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteLost(@PathVariable String id, Authentication auth) {
        itemService.deleteLost(id, auth.getName());
        return ResponseEntity.ok(ApiResponse.ok("Deleted", null));
    }

    // ================= FOUND =================

    @PostMapping(value = "/found", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<FoundItem>> createFound(
            @RequestPart("data") @Valid ItemRequest req,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok("Found report created",
                itemService.createFound(auth.getName(), req, images)));
    }

    @GetMapping("/found")
    public ResponseEntity<ApiResponse<Page<FoundItem>>> listFound(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String categoryId) {
        return ResponseEntity.ok(ApiResponse.ok("OK",
                itemService.listFound(page, size, keyword, categoryId)));
    }

    @GetMapping("/found/{id}")
    public ResponseEntity<ApiResponse<FoundItem>> getFound(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok("OK", itemService.getFound(id)));
    }

    @DeleteMapping("/found/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFound(@PathVariable String id, Authentication auth) {
        itemService.deleteFound(id, auth.getName());
        return ResponseEntity.ok(ApiResponse.ok("Deleted", null));
    }

    // ================= TIMELINE =================

    @GetMapping("/{type}/{id}/timeline")
    public ResponseEntity<ApiResponse<List<TimelineEvent>>> timeline(
            @PathVariable String type,
            @PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok("OK", itemService.getTimeline(type, id)));
    }
}