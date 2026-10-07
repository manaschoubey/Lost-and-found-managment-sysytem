package com.lostfound.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ClaimRequest {

    @NotBlank private String foundItemId;
    @NotBlank private String proofDescription;
}