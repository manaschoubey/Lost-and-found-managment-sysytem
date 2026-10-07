package com.lostfound.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.lostfound.model.ItemStatus;
import com.lostfound.model.LostItem;

public interface LostItemRepository extends MongoRepository<LostItem, String> {
    Page<LostItem> findByUserId(String userId, Pageable pageable);
    List<LostItem> findByStatus(ItemStatus status);
    long countByUserId(String userId);
}