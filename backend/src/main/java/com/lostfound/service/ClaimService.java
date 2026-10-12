package com.lostfound.service;

import com.lostfound.dto.ClaimRequest;
import com.lostfound.model.*;
import com.lostfound.repository.*;
import com.lostfound.util.FileStorageUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class ClaimService {

    @Autowired private ClaimRepository claimRepo;
    @Autowired private FoundItemRepository foundRepo;
    @Autowired private NotificationRepository notificationRepo;
    @Autowired private FileStorageUtil fileStorage;
    @Autowired private ChatService chatService;
    @Autowired private ChatRoomRepository chatRoomRepo;

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

        if (status == ClaimStatus.APPROVED) {
            FoundItem found = foundRepo.findById(claim.getFoundItemId())
                    .orElseThrow(() -> new RuntimeException("Found item not found"));
            found.setStatus(ItemStatus.CLAIMED);
            found.setUpdatedAt(LocalDateTime.now());
            foundRepo.save(found);

            chatService.createRoomForClaim(claim);

            notify(claim.getClaimantUserId(), "Claim Approved",
                    "Your claim for '" + found.getItemName() + "' was approved. Start chatting with the finder!");

        } else if (status == ClaimStatus.REJECTED) {
            notify(claim.getClaimantUserId(), "Claim Rejected",
                    "Your claim was rejected. Reason: " + adminRemarks);
        }

        return claim;
    }

    /**
     * Returns the chat room that was created for an approved claim.
     * Admin can use this to monitor the conversation between finder and claimant.
     */
    public ChatRoom getChatRoomForClaim(String claimId) {
        Claim claim = claimRepo.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Claim not found"));

        if (claim.getStatus() != ClaimStatus.APPROVED) {
            throw new RuntimeException("Chat room only available for approved claims");
        }

        List<ChatRoom> rooms = chatRoomRepo.findByClaimId(claimId);
        if (rooms.isEmpty()) {
            throw new RuntimeException("No chat room found for this claim");
        }
        return rooms.get(0);
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