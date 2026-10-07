package com.lostfound.repository;

import com.lostfound.model.FoundItem;
import com.lostfound.model.ItemStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoundItemRepository extends MongoRepository<FoundItem, String> {

    List<FoundItem> findByUserId(String userId);

    List<FoundItem> findByStatus(ItemStatus status);

    List<FoundItem> findByCategoryId(String categoryId);

    List<FoundItem> findByStatusAndCategoryId(ItemStatus status, String categoryId);

    List<FoundItem> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String title, String description);

    long countByStatus(ItemStatus status);
}
