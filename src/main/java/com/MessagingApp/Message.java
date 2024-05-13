package com.MessagingApp;

import java.time.LocalDateTime;

public class Message {
    private String sender;
    private String content;
    private LocalDateTime createdAt;

    public Message() {
    }

    public Message(String sender, String content, LocalDateTime createdAt) {
        this.sender = sender;
        this.content = content;
        this.createdAt = createdAt;
    }

    public String getSender() {
        return this.sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public String getContent() {
        return this.content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getCreatedAt() {
        return this.createdAt;
    }

    public void setCreatedAt(LocalDateTime dateTime) {
        this.createdAt = dateTime;
    }
}
