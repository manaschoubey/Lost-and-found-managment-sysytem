package com.lostfound.service;

import com.lostfound.dto.ItemRequest;
import com.lostfound.dto.TimelineEvent;
import com.lostfound.model.*;
import com.lostfound.repository.*;
import com.lostfound.util.FileStorageUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class ItemService {

    @Autowired private LostItemRepository lostRepo;
    @Autowired private FoundItemRepository foundRepo;
    @Autowired private MatchRepository matchRepo;
    @Autowired private ClaimRepository claimRepo;
    @Autowired private MatchingService matchingService;
    @Autowired private FileStorageUtil fileStorage;

    // ================= LOST =================

    public LostItem createLost(String userId, ItemRequest req, List<MultipartFile> images) {
        LostItem item = new LostItem();
        item.setUserId(userId);
        item.setItemName(req.getItemName());
        item.setDescription(req.getDescription());
        item.setCategoryId(req.getCategoryId());
        item.setLocation(req.getLocation());
        item.setLostDate(req.getDate());
        item.setContactInfo(req.getContactInfo());
        item.setImageUrls(saveImages(images));
        item.setStatus(ItemStatus.LOST);

        LostItem saved = lostRepo.save(item);
        matchingService.matchForLostItem(saved);
        return saved;
    }

    public Page<LostItem> listLost(int page, int size, String keyword, String categoryId) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<LostItem> all = lostRepo.findAll(pageable);

        if ((keyword == null || keyword.isBlank()) && (categoryId == null || categoryId.isBlank())) {
            return all;
        }

        List<LostItem> filtered = all.getContent().stream()
                .filter(i -> keyword == null || keyword.isBlank()
                        || (i.getItemName() != null && i.getItemName().toLowerCase().contains(keyword.toLowerCase())))
                .filter(i -> categoryId == null || categoryId.isBlank() || categoryId.equals(i.getCategoryId()))
                .toList();

        return new PageImpl<>(filtered, pageable, filtered.size());
    }

    public LostItem getLost(String id) {
        return lostRepo.findById(id).orElseThrow(() -> new RuntimeException("Lost item not found"));
    }

    public void deleteLost(String id, String userId) {
        LostItem i = getLost(id);
        if (!i.getUserId().equals(userId)) throw new RuntimeException("Not allowed");
        lostRepo.delete(i);
    }

    // ================= FOUND =================

    public FoundItem createFound(String userId, ItemRequest req, List<MultipartFile> images) {
        FoundItem item = new FoundItem();
        item.setUserId(userId);
        item.setItemName(req.getItemName());
        item.setDescription(req.getDescription());
        item.setCategoryId(req.getCategoryId());
        item.setLocation(req.getLocation());
        item.setFoundDate(req.getDate());
        item.setContactInfo(req.getContactInfo());
        item.setImageUrls(saveImages(images));
        item.setStatus(ItemStatus.FOUND);

        FoundItem saved = foundRepo.save(item);
        matchingService.matchForFoundItem(saved);
        return saved;
    }

    public Page<FoundItem> listFound(int page, int size, String keyword, String categoryId) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<FoundItem> all = foundRepo.findAll(pageable);

        if ((keyword == null || keyword.isBlank()) && (categoryId == null || categoryId.isBlank())) {
            return all;
        }

        List<FoundItem> filtered = all.getContent().stream()
                .filter(i -> keyword == null || keyword.isBlank()
                        || (i.getItemName() != null && i.getItemName().toLowerCase().contains(keyword.toLowerCase())))
                .filter(i -> categoryId == null || categoryId.isBlank() || categoryId.equals(i.getCategoryId()))
                .toList();

        return new PageImpl<>(filtered, pageable, filtered.size());
    }

    public FoundItem getFound(String id) {
        return foundRepo.findById(id).orElseThrow(() -> new RuntimeException("Found item not found"));
    }

    public void deleteFound(String id, String userId) {
        FoundItem i = getFound(id);
        if (!i.getUserId().equals(userId)) throw new RuntimeException("Not allowed");
        foundRepo.delete(i);
    }

    // ================= TIMELINE =================

    public List<TimelineEvent> getTimeline(String type, String itemId) {
        List<TimelineEvent> events = new ArrayList<>();

        if ("lost".equalsIgnoreCase(type)) {
            LostItem item = getLost(itemId);

            events.add(new TimelineEvent("REPORTED", "Lost item reported",
                    "Reported at " + item.getLocation(),
                    item.getCreatedAt(), "red"));

            for (Match m : matchRepo.findByLostItemId(itemId)) {
                events.add(new TimelineEvent("MATCH", "Possible match found",
                        "Match score: " + Math.round(m.getScore() * 100) + "%",
                        m.getCreatedAt(), "yellow"));
            }

        } else {
            FoundItem item = getFound(itemId);

            events.add(new TimelineEvent("REPORTED", "Found item reported",
                    "Reported at " + item.getLocation(),
                    item.getCreatedAt(), "green"));

            for (Match m : matchRepo.findByFoundItemId(itemId)) {
                events.add(new TimelineEvent("MATCH", "Possible match found",
                        "Match score: " + Math.round(m.getScore() * 100) + "%",
                        m.getCreatedAt(), "yellow"));
            }

            for (Claim c : claimRepo.findByFoundItemId(itemId)) {
                String desc = c.getProofDescription() == null ? ""
                        : c.getProofDescription().substring(0,
                            Math.min(80, c.getProofDescription().length()));

                events.add(new TimelineEvent("CLAIM", "Claim submitted",
                        desc, c.getCreatedAt(), "blue"));

                if (c.getStatus() != ClaimStatus.PENDING) {
                    String color = c.getStatus() == ClaimStatus.APPROVED ? "green"
                                 : c.getStatus() == ClaimStatus.REJECTED ? "red" : "yellow";
                    events.add(new TimelineEvent("CLAIM_" + c.getStatus(),
                            "Claim " + c.getStatus().name().toLowerCase().replace("_", " "),
                            c.getAdminRemarks() != null ? c.getAdminRemarks() : "No remarks",
                            c.getUpdatedAt(), color));
                }
            }

            if (item.getStatus() == ItemStatus.CLAIMED) {
                events.add(new TimelineEvent("RETURNED", "Item claimed",
                        "Owner approved. Arrange pickup with finder.",
                        item.getUpdatedAt(), "purple"));
            }
        }

        events.sort(Comparator.comparing(TimelineEvent::getTimestamp));
        return events;
    }

    // ================= HELPERS =================

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