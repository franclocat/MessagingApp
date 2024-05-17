package com.MessagingApp;

import org.springframework.javapoet.ClassName;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.logging.Logger;

public class ChatWebSocketHandler extends TextWebSocketHandler {

    private static List<WebSocketSession> sessions = new CopyOnWriteArrayList<>();
    private static final Logger LOGGER = Logger.getLogger(ClassName.class.getName());
    private static List<String> publicMessages = new CopyOnWriteArrayList<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.add(session);
        sendPreviousMessagesToSelf(session);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        broadcast(message.getPayload());
        LOGGER.info("Received message: " + message.getPayload());
        saveMessage(message.getPayload());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, org.springframework.web.socket.CloseStatus status) throws Exception {
        sessions.remove(session);
    }

    public void broadcast(String message) throws IOException {
        for (WebSocketSession session  : sessions) {
            session.sendMessage(new TextMessage(message));
        }
        LOGGER.info("The message has been broadcasted");
    }

    public void saveMessage(String message) {
        publicMessages.add(message);
        LOGGER.info("The message has been saved");
    }

    public void sendPreviousMessagesToSelf(WebSocketSession session) throws IOException {
        for (String message : publicMessages) {
            session.sendMessage(new TextMessage(message));
        }
        LOGGER.info("The messages sent previously have been sent to you");
    }
}