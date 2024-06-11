package com.MessagingApp;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    @Query("SELECT m FROM Message m WHERE (m.sender = :user1 AND m.receiver = :user2) OR (m.sender = :user2 AND m.receiver = :user1) ORDER BY m.sentAt ASC")
    List<Message> findChatHistoryBetween(@Param("user1") String user1, @Param("user2") String user2);

    @Query("SELECT m FROM Message m WHERE m.receiver = 'Public chat' ORDER BY m.sentAt ASC")
    List<Message> loadPublicChat();
}