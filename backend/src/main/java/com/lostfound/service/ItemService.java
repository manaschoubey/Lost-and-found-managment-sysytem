package com.lostfound.service;

import com.lostfound.dto.ItemRequest;
import com.lostfound.model.*;
import com.lostfound.repository.FoundItemRepository;
import com.lostfound.repository.LostItemRepository;
import com.lostfound.repository.UserRepository;
import com.lostfound.util.FileStorageUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ItemService {

    private final LostItemRepository lostItemRepository;
    private final FoundItemRepository foundItemRepository;
    private final UserRepository userRepository;
    private final FileStorageUtil fileStorageUtil;
    private final MatchingService matchingService;

    // ===================== LOST ITEMS =====================

    public LostItem reportLostItem(ItemRequest request, List<MultipartFile> images, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LostItem item = new LostItem();
        item.setTitle(request.getTitle());
        item.setDescription(request.getDescription());
        item.setCategoryId(request.getCategoryId());
        item.setLocation(request.getLocation());
        item.setUserId(user.getId());

        if (request.getDate() != null && !request.getDate().isEmpty()) {
            item.setDateLost(LocalDateTime.parse(request.getDate()));
        }

        List<String> imageUrls = new ArrayList<>();
        if (images != null) {
            for (MultipartFile img : images) {
                if (!img.isEmpty()) {
                    imageUrls.add(fileStorageUtil.storeFile(img));
                }
            }
        }
        item.setImageUrls(imageUrls);

        LostItem saved = lostItemRepository.save(item);

        // Trigger automatic matching
        matchingService.findMatchesForLostItem(saved);

        return saved;
    }

    public List<LostItem> getAllLostItems() {
        return lostItemRepository.findAll();
    }

    public LostItem getLostItemById(String id) {
        return lostItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lost item not found"));
    }

    public List<LostItem> getLostItemsByUser(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return lostItemRepository.findByUserId(user.getId());
    }

    public List<LostItem> searchLostItems(String keyword) {
        return lostItemRepository
                .findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(keyword, keyword);
    }

    public LostItem updateLostItem(String id, ItemRequest request, String userEmail) {
        LostItem item = getLostItemById(id);
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!item.getUserId().equals(user.getId())) {
            throw new RuntimeException("You can only update your own items");
        }

        item.setTitle(request.getTitle());
        item.setDescription(request.getDescription());
        item.setCategoryId(request.getCategoryId());
        item.setLocation(request.getLocation());
        if (request.getDate() != null && !request.getDate().isEmpty()) {
            item.setDateLost(LocalDateTime.parse(request.getDate()));
        }
        item.setUpdatedAt(LocalDateTime.now());

        return lostItemRepository.save(item);
    }

    public void deleteLostItem(String id, String userEmail) {
        LostItem item = getLostItemById(id);
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!item.getUserId().equals(user.getId())) {
            throw new RuntimeException("You can only delete your own items");
        }

        lostItemRepository.deleteById(id);
    }

    // ===================== FOUND ITEMS =====================

    public FoundItem reportFoundItem(ItemRequest request, List<MultipartFile> images, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        FoundItem item = new FoundItem();
        item.setTitle(request.getTitle());
        item.setDescription(request.getDescription());
        item.setCategoryId(request.getCategoryId());
        item.setLocationFound(request.getLocation());
        item.setUserId(user.getId());

        if (request.getDate() != null && !request.getDate().isEmpty()) {
            item.setDateFound(LocalDateTime.parse(request.getDate()));
        }

        List<String> imageUrls = new ArrayList<>();
        if (images != null) {
            for (MultipartFile img : images) {
                if (!img.isEmpty()) {
                    imageUrls.add(fileStorageUtil.storeFile(img));
                }
            }
        }
        item.setImageUrls(imageUrls);

        FoundItem saved = foundItemRepository.save(item);

        // Trigger automatic matching
        matchingService.findMatchesForFoundItem(saved);

        return saved;
    }

    public List<FoundItem> getAllFoundItems() {
        return foundItemRepository.findAll();
    }

    public FoundItem getFoundItemById(String id) {
        return foundItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Found item not found"));
    }

    public List<FoundItem> getFoundItemsByUser(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return foundItemRepository.findByUserId(user.getId());
    }

    public List<FoundItem> searchFoundItems(String keyword) {
        return foundItemRepository
                .findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(keyword, keyword);
    }

    public FoundItem updateFoundItem(String id, ItemRequest request, String userEmail) {
        FoundItem item = getFoundItemById(id);
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!item.getUserId().equals(user.getId())) {
            throw new RuntimeException("You can only update your own items");
        }

        item.setTitle(request.getTitle());
        item.setDescription(request.getDescription());
        item.setCategoryId(request.getCategoryId());
        item.setLocationFound(request.getLocation());
        if (request.getDate() != null && !request.getDate().isEmpty()) {
            item.setDateFound(LocalDateTime.parse(request.getDate()));
        }
        item.setUpdatedAt(LocalDateTime.now());

        return foundItemRepository.save(item);
    }

    public void deleteFoundItem(String id, String userEmail) {
        FoundItem item = getFoundItemById(id);
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!item.getUserId().equals(user.getId())) {
            throw new RuntimeException("You can only delete your own items");
        }

        foundItemRepository.deleteById(id);
    }
}
