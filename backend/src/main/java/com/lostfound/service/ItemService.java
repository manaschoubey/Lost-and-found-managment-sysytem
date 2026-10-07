package com.lostfound.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.lostfound.dto.ItemRequest;
import com.lostfound.model.FoundItem;
import com.lostfound.model.ItemStatus;
import com.lostfound.model.LostItem;
import com.lostfound.repository.FoundItemRepository;
import com.lostfound.repository.LostItemRepository;

@Service
public class ItemService {

    @Autowired private LostItemRepository lostRepo;
    @Autowired private FoundItemRepository foundRepo;
    @Autowired private MatchingService matchingService;
    @Autowired private com.lostfound.util.FileStorageUtil fileStorage;

    // ---- LOST ----
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
        // simple in-memory filter if keyword given; else all
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

    // ---- FOUND ----
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