package com.lostfound.repository;

import com.lostfound.model.ItemStatus;
import com.lostfound.model.LostItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LostItemRepository extends MongoRepository<LostItem, String> {

    List<LostItem> findByUserId(String userId);

    List<LostItem> findByStatus(ItemStatus status);

    List<LostItem> findByCategoryId(String categoryId);

    List<LostItem> findByStatusAndCategoryId(ItemStatus status, String categoryId);

    List<LostItem> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String title, String description);

    long countByStatus(ItemStatus status);
}
