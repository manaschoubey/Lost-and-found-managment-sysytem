package com.lostfound.controller;

import com.lostfound.dto.ApiResponse;
import com.lostfound.model.Claim;
import com.lostfound.service.ClaimService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/claims")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminClaimController {

    private final ClaimService claimService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Claim>>> getAllClaims() {
        return ResponseEntity.ok(ApiResponse.success("All claims", claimService.getAllClaims()));
    }

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<Claim>>> getPendingClaims() {
        return ResponseEntity.ok(ApiResponse.success("Pending claims", claimService.getAllPendingClaims()));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<Claim>> approveClaim(
            @PathVariable String id,
            @RequestParam(required = false, defaultValue = "") String notes) {
        Claim claim = claimService.approveClaim(id, notes);
        return ResponseEntity.ok(ApiResponse.success("Claim approved", claim));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<Claim>> rejectClaim(
            @PathVariable String id,
            @RequestParam(required = false, defaultValue = "") String notes) {
        Claim claim = claimService.rejectClaim(id, notes);
        return ResponseEntity.ok(ApiResponse.success("Claim rejected", claim));
    }
}
