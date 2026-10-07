package com.lostfound.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lostfound.model.Notification;
import com.lostfound.repository.NotificationRepository;

@Service
public class NotificationService {

    @Autowired private NotificationRepository repo;

    public List<Notification> list(String userId) {
        return repo.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> unread(String userId) {
        return repo.findByUserIdAndReadFalse(userId);
    }

    public long unreadCount(String userId) {
        return repo.countByUserIdAndReadFalse(userId);
    }

    public void markRead(String notificationId) {
        Notification n = repo.findById(notificationId).orElseThrow();
        n.setRead(true);
        repo.save(n);
    }
}