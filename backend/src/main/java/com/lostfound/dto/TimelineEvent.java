package com.lostfound.dto;

import java.time.LocalDateTime;

public class TimelineEvent {

    private String type;
    private String title;
    private String description;
    private LocalDateTime timestamp;
    private String badge;

    public TimelineEvent() {}

    public TimelineEvent(String type, String title, String description,
                         LocalDateTime timestamp, String badge) {
        this.type = type;
        this.title = title;
        this.description = description;
        this.timestamp = timestamp;
        this.badge = badge;
    }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getBadge() { return badge; }
    public void setBadge(String badge) { this.badge = badge; }
}