package com.lostfound.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.lostfound.model.FoundItem;
import com.lostfound.model.ItemStatus;

public interface FoundItemRepository extends MongoRepository<FoundItem, String> {
    Page<FoundItem> findByUserId(String userId, Pageable pageable);
    List<FoundItem> findByStatus(ItemStatus status);
    long countByUserId(String userId);
}