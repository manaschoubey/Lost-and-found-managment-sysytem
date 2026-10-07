package com.lostfound.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.lostfound.model.Notification;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Notification> findByUserIdAndReadFalse(String userId);
    long countByUserIdAndReadFalse(String userId);
}