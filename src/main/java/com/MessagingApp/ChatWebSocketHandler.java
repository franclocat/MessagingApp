package com.MessagingApp;

import org.springframework.stereotype.Controller;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import org.slf4j.LoggerFactory;

@Controller
public class ChatWebSocketHandler extends TextWebSocketHandler {

    private static List<WebSocketSession> sessions = new CopyOnWriteArrayList<>();
    private List<Message> allMessages = new CopyOnWriteArrayList<>();

    private final ObjectMapper mapper = new ObjectMapper().registerModules(new JavaTimeModule());
    
    private static final org.slf4j.Logger LOGGER = LoggerFactory.getLogger(ChatWebSocketHandler.class);

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.add(session);
        showPrevoiusMessages(session);//send all the messages in the messages list to the newly joined user
        //broadcast("User joined the chat!");
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        Message messageObject = mapper.readValue(message.getPayload(), Message.class); //convert the received TextMessage (JSON String) to a Message object
        LOGGER.info("Server received message: \n" + mapper.writerWithDefaultPrettyPrinter().writeValueAsString(messageObject));
        allMessages.add(messageObject);//add the message object to the allMessages list
        LOGGER.info("The message object has been added to the allMessages List \n");
        broadcast(messageObject);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, org.springframework.web.socket.CloseStatus status) throws Exception {
        sessions.remove(session);
        //broadcast("User left the chat!");
    }

    private void broadcast(Message message) throws IOException {
        String jsonMessage = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(message); //Convert the passed Message object back into a JSON String
        LOGGER.info("Broadcasted message: \n" + jsonMessage);
        for (WebSocketSession session : sessions) {
            session.sendMessage(new TextMessage(jsonMessage)); //send the JSON String to every session in the sessions list
        }
    }

    private void showPrevoiusMessages(WebSocketSession session) throws IOException {
        //send all the previous messages to the user 
        for (Message message : allMessages) {
            session.sendMessage(new TextMessage(mapper.writerWithDefaultPrettyPrinter().writeValueAsString(message)));
        }
    }
}