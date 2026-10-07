package com.lostfound.service;

import com.lostfound.dto.ClaimRequest;
import com.lostfound.model.*;
import com.lostfound.repository.ClaimRepository;
import com.lostfound.repository.FoundItemRepository;
import com.lostfound.repository.UserRepository;
import com.lostfound.util.FileStorageUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ClaimService {

    private final ClaimRepository claimRepository;
    private final FoundItemRepository foundItemRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final FileStorageUtil fileStorageUtil;

    public Claim submitClaim(ClaimRequest request, MultipartFile proofImage, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        FoundItem foundItem = foundItemRepository.findById(request.getFoundItemId())
                .orElseThrow(() -> new RuntimeException("Found item not found"));

        if (claimRepository.existsByFoundItemIdAndClaimantId(request.getFoundItemId(), user.getId())) {
            throw new RuntimeException("You have already submitted a claim for this item");
        }

        Claim claim = new Claim();
        claim.setFoundItemId(request.getFoundItemId());
        claim.setClaimantId(user.getId());
        claim.setProofDescription(request.getProofDescription());

        if (proofImage != null && !proofImage.isEmpty()) {
            claim.setProofImageUrl(fileStorageUtil.storeFile(proofImage));
        }

        Claim saved = claimRepository.save(claim);

        // Notify the user who found the item
        notificationService.sendNotification(
                foundItem.getUserId(),
                "New Claim Submitted",
                "Someone has claimed your found item: \"" + foundItem.getTitle() + "\""
        );

        return saved;
    }

    public List<Claim> getClaimsByUser(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return claimRepository.findByClaimantId(user.getId());
    }

    public List<Claim> getClaimsForItem(String foundItemId) {
        return claimRepository.findByFoundItemId(foundItemId);
    }

    public List<Claim> getAllPendingClaims() {
        return claimRepository.findByStatus(ClaimStatus.PENDING);
    }

    public List<Claim> getAllClaims() {
        return claimRepository.findAll();
    }

    public Claim approveClaim(String claimId, String adminNotes) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Claim not found"));

        claim.setStatus(ClaimStatus.APPROVED);
        claim.setAdminNotes(adminNotes);
        claim.setUpdatedAt(LocalDateTime.now());

        // Update the found item status
        FoundItem foundItem = foundItemRepository.findById(claim.getFoundItemId())
                .orElseThrow(() -> new RuntimeException("Found item not found"));
        foundItem.setStatus(ItemStatus.CLAIMED);
        foundItem.setUpdatedAt(LocalDateTime.now());
        foundItemRepository.save(foundItem);

        // Notify the claimant
        notificationService.sendNotification(
                claim.getClaimantId(),
                "Claim Approved!",
                "Your claim for \"" + foundItem.getTitle() + "\" has been approved. Please arrange pickup."
        );

        return claimRepository.save(claim);
    }

    public Claim rejectClaim(String claimId, String adminNotes) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Claim not found"));

        claim.setStatus(ClaimStatus.REJECTED);
        claim.setAdminNotes(adminNotes);
        claim.setUpdatedAt(LocalDateTime.now());

        // Notify the claimant
        FoundItem foundItem = foundItemRepository.findById(claim.getFoundItemId())
                .orElseThrow(() -> new RuntimeException("Found item not found"));

        notificationService.sendNotification(
                claim.getClaimantId(),
                "Claim Rejected",
                "Your claim for \"" + foundItem.getTitle() + "\" has been rejected. Reason: " + adminNotes
        );

        return claimRepository.save(claim);
    }
}
