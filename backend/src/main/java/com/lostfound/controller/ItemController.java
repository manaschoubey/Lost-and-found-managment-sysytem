package com.lostfound.controller;

import com.lostfound.dto.ApiResponse;
import com.lostfound.dto.ItemRequest;
import com.lostfound.model.FoundItem;
import com.lostfound.model.LostItem;
import com.lostfound.model.Match;
import com.lostfound.service.ItemService;
import com.lostfound.service.MatchingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;
    private final MatchingService matchingService;

    // ===================== LOST ITEMS =====================

    @PostMapping(value = "/lost", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<LostItem>> reportLostItem(
            @RequestPart("item") ItemRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            Authentication auth) {
        LostItem item = itemService.reportLostItem(request, images, auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Lost item reported successfully", item));
    }

    @GetMapping("/lost")
    public ResponseEntity<ApiResponse<List<LostItem>>> getAllLostItems() {
        return ResponseEntity.ok(ApiResponse.success("Lost items retrieved", itemService.getAllLostItems()));
    }

    @GetMapping("/lost/{id}")
    public ResponseEntity<ApiResponse<LostItem>> getLostItem(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success("Lost item retrieved", itemService.getLostItemById(id)));
    }

    @GetMapping("/lost/my")
    public ResponseEntity<ApiResponse<List<LostItem>>> getMyLostItems(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Your lost items", itemService.getLostItemsByUser(auth.getName())));
    }

    @GetMapping("/lost/search")
    public ResponseEntity<ApiResponse<List<LostItem>>> searchLostItems(@RequestParam String keyword) {
        return ResponseEntity.ok(ApiResponse.success("Search results", itemService.searchLostItems(keyword)));
    }

    @PutMapping("/lost/{id}")
    public ResponseEntity<ApiResponse<LostItem>> updateLostItem(
            @PathVariable String id,
            @RequestBody ItemRequest request,
            Authentication auth) {
        LostItem updated = itemService.updateLostItem(id, request, auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Lost item updated", updated));
    }

    @DeleteMapping("/lost/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteLostItem(@PathVariable String id, Authentication auth) {
        itemService.deleteLostItem(id, auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Lost item deleted"));
    }

    // ===================== FOUND ITEMS =====================

    @PostMapping(value = "/found", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<FoundItem>> reportFoundItem(
            @RequestPart("item") ItemRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            Authentication auth) {
        FoundItem item = itemService.reportFoundItem(request, images, auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Found item reported successfully", item));
    }

    @GetMapping("/found")
    public ResponseEntity<ApiResponse<List<FoundItem>>> getAllFoundItems() {
        return ResponseEntity.ok(ApiResponse.success("Found items retrieved", itemService.getAllFoundItems()));
    }

    @GetMapping("/found/{id}")
    public ResponseEntity<ApiResponse<FoundItem>> getFoundItem(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success("Found item retrieved", itemService.getFoundItemById(id)));
    }

    @GetMapping("/found/my")
    public ResponseEntity<ApiResponse<List<FoundItem>>> getMyFoundItems(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Your found items", itemService.getFoundItemsByUser(auth.getName())));
    }

    @GetMapping("/found/search")
    public ResponseEntity<ApiResponse<List<FoundItem>>> searchFoundItems(@RequestParam String keyword) {
        return ResponseEntity.ok(ApiResponse.success("Search results", itemService.searchFoundItems(keyword)));
    }

    @PutMapping("/found/{id}")
    public ResponseEntity<ApiResponse<FoundItem>> updateFoundItem(
            @PathVariable String id,
            @RequestBody ItemRequest request,
            Authentication auth) {
        FoundItem updated = itemService.updateFoundItem(id, request, auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Found item updated", updated));
    }

    @DeleteMapping("/found/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFoundItem(@PathVariable String id, Authentication auth) {
        itemService.deleteFoundItem(id, auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Found item deleted"));
    }

    // ===================== MATCHES =====================

    @GetMapping("/lost/{id}/matches")
    public ResponseEntity<ApiResponse<List<Match>>> getMatchesForLostItem(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success("Matches retrieved", matchingService.getMatchesForLostItem(id)));
    }

    @GetMapping("/found/{id}/matches")
    public ResponseEntity<ApiResponse<List<Match>>> getMatchesForFoundItem(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success("Matches retrieved", matchingService.getMatchesForFoundItem(id)));
    }

    @PostMapping("/matches/{matchId}/confirm")
    public ResponseEntity<ApiResponse<Match>> confirmMatch(@PathVariable String matchId) {
        return ResponseEntity.ok(ApiResponse.success("Match confirmed", matchingService.confirmMatch(matchId)));
    }

    @PostMapping("/matches/{matchId}/reject")
    public ResponseEntity<ApiResponse<Match>> rejectMatch(@PathVariable String matchId) {
        return ResponseEntity.ok(ApiResponse.success("Match rejected", matchingService.rejectMatch(matchId)));
    }
}
