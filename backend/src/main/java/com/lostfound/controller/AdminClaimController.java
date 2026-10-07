package com.lostfound.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lostfound.dto.ApiResponse;
import com.lostfound.model.Claim;
import com.lostfound.model.ClaimStatus;
import com.lostfound.service.ClaimService;

@RestController
@RequestMapping("/api/admin/claims")
public class AdminClaimController {

    @Autowired private ClaimService claimService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Claim>>> all() {
        return ResponseEntity.ok(ApiResponse.ok("OK", claimService.allClaims()));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<Claim>> approve(@PathVariable String id,
                                                      @RequestParam(required = false) String remarks) {
        return ResponseEntity.ok(ApiResponse.ok("Approved",
                claimService.updateStatus(id, ClaimStatus.APPROVED, remarks)));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<Claim>> reject(@PathVariable String id,
                                                     @RequestParam(required = false) String remarks) {
        return ResponseEntity.ok(ApiResponse.ok("Rejected",
                claimService.updateStatus(id, ClaimStatus.REJECTED, remarks)));
    }

    @PutMapping("/{id}/review")
    public ResponseEntity<ApiResponse<Claim>> review(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok("Under review",
                claimService.updateStatus(id, ClaimStatus.UNDER_REVIEW, null)));
    }
}