package com.lostfound.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.lostfound.dto.ApiResponse;
import com.lostfound.dto.ClaimRequest;
import com.lostfound.model.Claim;
import com.lostfound.service.ClaimService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/claims")
public class ClaimController {

    @Autowired private ClaimService claimService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Claim>> create(
            @RequestPart("data") @Valid ClaimRequest req,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok("Claim submitted",
                claimService.createClaim(auth.getName(), req, images)));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<Claim>>> my(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok("OK", claimService.myClaims(auth.getName())));
    }
}