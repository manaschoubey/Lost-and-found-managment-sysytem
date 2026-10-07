package com.lostfound.controller;

import com.lostfound.dto.ApiResponse;
import com.lostfound.dto.ClaimRequest;
import com.lostfound.model.Claim;
import com.lostfound.service.ClaimService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/claims")
@RequiredArgsConstructor
public class ClaimController {

    private final ClaimService claimService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Claim>> submitClaim(
            @RequestPart("claim") ClaimRequest request,
            @RequestPart(value = "proofImage", required = false) MultipartFile proofImage,
            Authentication auth) {
        Claim claim = claimService.submitClaim(request, proofImage, auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Claim submitted successfully", claim));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<Claim>>> getMyClaims(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Your claims", claimService.getClaimsByUser(auth.getName())));
    }

    @GetMapping("/item/{foundItemId}")
    public ResponseEntity<ApiResponse<List<Claim>>> getClaimsForItem(@PathVariable String foundItemId) {
        return ResponseEntity.ok(ApiResponse.success("Claims for item", claimService.getClaimsForItem(foundItemId)));
    }
}
