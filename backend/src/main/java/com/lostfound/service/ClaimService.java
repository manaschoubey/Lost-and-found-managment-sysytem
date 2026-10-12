package com.lostfound.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.lostfound.dto.ClaimRequest;
import com.lostfound.model.Claim;
import com.lostfound.model.ClaimStatus;
import com.lostfound.model.FoundItem;
import com.lostfound.model.ItemStatus;
import com.lostfound.model.Notification;
import com.lostfound.repository.ClaimRepository;
import com.lostfound.repository.FoundItemRepository;
import com.lostfound.repository.NotificationRepository;

@Service
public class ClaimService {

    @Autowired private ClaimRepository claimRepo;
    @Autowired private FoundItemRepository foundRepo;
    @Autowired private NotificationRepository notificationRepo;
    @Autowired private com.lostfound.util.FileStorageUtil fileStorage;

    public Claim createClaim(String userId, ClaimRequest req, List<MultipartFile> images) {
        foundRepo.findById(req.getFoundItemId())
                .orElseThrow(() -> new RuntimeException("Found item not found"));

        Claim claim = new Claim();
        claim.setFoundItemId(req.getFoundItemId());
        claim.setClaimantUserId(userId);
        claim.setProofDescription(req.getProofDescription());
        claim.setProofImages(saveImages(images));
        claim.setStatus(ClaimStatus.PENDING);
        return claimRepo.save(claim);
    }

    public List<Claim> myClaims(String userId) {
        return claimRepo.findByClaimantUserId(userId);
    }

    public List<Claim> allClaims() {
        return claimRepo.findAll();
    }

    public Claim updateStatus(String claimId, ClaimStatus status, String adminRemarks) {
        Claim claim = claimRepo.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Claim not found"));
        claim.setStatus(status);
        claim.setAdminRemarks(adminRemarks);
        claim.setUpdatedAt(LocalDateTime.now());
        claimRepo.save(claim);

        // If approved — update item + notify
        if (status == ClaimStatus.APPROVED) {
            FoundItem found = foundRepo.findById(claim.getFoundItemId())
                    .orElseThrow(() -> new RuntimeException("Found item not found"));
            found.setStatus(ItemStatus.CLAIMED);
            foundRepo.save(found);

            notify(claim.getClaimantUserId(),
                    "Claim Approved",
                    "Your claim for '" + found.getItemName() + "' was approved.");
        } else if (status == ClaimStatus.REJECTED) {
            notify(claim.getClaimantUserId(),
                    "Claim Rejected",
                    "Your claim was rejected. Reason: " + adminRemarks);
        }

        return claim;
    }

    private void notify(String userId, String title, String msg) {
        Notification n = new Notification();
        n.setUserId(userId);
        n.setTitle(title);
        n.setMessage(msg);
        n.setType("CLAIM");
        notificationRepo.save(n);
    }

    private List<String> saveImages(List<MultipartFile> images) {
        List<String> urls = new ArrayList<>();
        if (images != null) {
            for (MultipartFile f : images) {
                if (!f.isEmpty()) urls.add(fileStorage.save(f));
            }
        }
        return urls;
    }
}