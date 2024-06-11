package com.MessagingApp;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class MessageController {
    @Autowired
    MessageRepository messageRepository;

    @Autowired
    SimpMessagingTemplate simpMessagingTemplate;

    @MessageMapping("/public")
    @SendTo("/topic/public")
    public Message sendPublic(Message message) {
        messageRepository.save(message);
        return message;
    }

    @MessageMapping("/user")
    public Message sendToSpecificUser(Message message) {
        messageRepository.save(message);
        simpMessagingTemplate.convertAndSendToUser(message.getReceiver(), "/messages", message);
        return message;
    }
}
