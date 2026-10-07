package com.lostfound.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.lostfound.dto.ApiResponse;
import com.lostfound.dto.ItemRequest;
import com.lostfound.model.FoundItem;
import com.lostfound.model.LostItem;
import com.lostfound.service.ItemService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/items")
public class ItemController {

    @Autowired private ItemService itemService;

    // ---- LOST ----
    @PostMapping(value = "/lost", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<LostItem>> createLost(
            @RequestPart("data") @Valid ItemRequest req,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            Authentication auth) {
        String userId = auth.getName();  // email used as name; get real ID below
        // We'll fetch real id from user repo
        return ResponseEntity.ok(ApiResponse.ok("Lost report created",
                itemService.createLost(userId, req, images)));
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

    // ---- FOUND ----
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
}