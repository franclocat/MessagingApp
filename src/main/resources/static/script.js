const loginContainer = document.querySelector(".login-container");
const inputUsername = document.querySelector("#input-username");
const sendUsernameButton = document.querySelector("#send-username-btn");

const appContainer = document.querySelector("#app");
const usersContainer = document.querySelector("#users");
const chatContainer = document.querySelector(".container");
const messages = document.querySelector("#messages");
const chatWith = document.querySelector("#chat-with");
const publicChatButton = document.querySelector("#public-chat-btn");

const inputMessage = document.querySelector("#input-msg");
const sendMessageButton = document.querySelector("#send-msg-btn");

let stompClient = null;
let username = null;
let selectedChat = "Public chat";

function loadPublicChat() {
  fetch("http://localhost:8080/message/getAllPublicMessages")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((messages) => {
      messages.forEach((element) => {
        displayMessage(element.sender, element.content, element.sentAt);
      });
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
}

publicChatButton.addEventListener("click", function () {
  changeChatWithTo("Public chat");
  loadPublicChat();
});

function changeChatWithTo(user) {
  messages.innerHTML = "";
  selectedChat = user; // Update selectedChat instead of receiver
  console.log("new selectedChat: " + selectedChat);
  chatWith.textContent = user;
  user !== "Public chat" && loadChatHistory(user);
}

function updateUserList(onlineUsers) {
  const userDivs = usersContainer.querySelectorAll("div.user"); // Select only divs with the class user
  userDivs.forEach((div) => usersContainer.removeChild(div));

  for (const sessionId in onlineUsers) {
    const user = onlineUsers[sessionId];
    if (user != username) {
      const userDiv = document.createElement("div");
      //userDiv.id = sessionId;
      userDiv.classList.add("user");
      userDiv.textContent = user;
      userDiv.addEventListener("click", function () {
        changeChatWithTo(user);
      });
      usersContainer.appendChild(userDiv);
    }
  }
}

function changeDisplay() {
  username = inputUsername.value;
  if (username !== "") {
    loginContainer.style.display = "none";
    appContainer.style.display = "flex";
    console.log("Username: " + username);
    connectWebSocket();
  }
}

function loadChatHistory(user) {
  fetch(`http://localhost:8080/chat-history?user1=${username}&user2=${user}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((messages) => {
      messages.forEach((element) => {
        displayMessage(element.sender, element.content, element.sentAt);
      });
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
}

function connectWebSocket() {
  const socket = new WebSocket("ws://localhost:8080/chat");
  stompClient = Stomp.over(socket);

  loadPublicChat();

  const headers = { username: username };

  stompClient.connect(
    headers,
    (frame) => {
      console.log("Connected: " + frame);

      // Subscribe to messages sent to the current user
      stompClient.subscribe("/user/" + username + "/messages", (message) => {
        console.log("private message received");
        const parsedMessage = JSON.parse(message.body);
        // Display the message if it's from the selected chat
        if (
          parsedMessage.sender === selectedChat ||
          parsedMessage.receiver === selectedChat
        ) {
          displayMessage(
            parsedMessage.sender,
            parsedMessage.content,
            parsedMessage.sentAt
          );
        }
      });

      stompClient.subscribe("/topic/public", (message) => {
        const parsedMessage = JSON.parse(message.body);
        if (selectedChat === "Public chat") {
          displayMessage(
            parsedMessage.sender,
            parsedMessage.content,
            parsedMessage.sentAt
          );
        }
      });

      stompClient.subscribe(
        "/topic/onlineUsers",
        (message) => {
          const users = JSON.parse(message.body);
          console.log("Online users: ", users);
          updateUserList(users);
        },
        headers
      );
    },
    (error) => {
      console.error("Error with websocket", error);
    }
  );
}

function inputValidation() {
  const messageContent = inputMessage.value;
  return username !== "" && messageContent !== "";
}

function sendMessage() {
  const content = inputMessage.value;
  const sentAt = new Date().toISOString();

  if (inputValidation()) {
    const message = {
      sender: username,
      receiver: selectedChat, // Use selectedChat
      content,
      sentAt,
    };

    if (selectedChat === "Public chat") {
      stompClient.send("/app/public", {}, JSON.stringify(message));
    } else {
      displayMessage(username, content, sentAt);
      stompClient.send("/app/user", {}, JSON.stringify(message));
    }
    inputMessage.value = "";
  } else {
    console.log("The message content can't be empty.");
  }
}

inputMessage.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    e.preventDefault(); // Prevent the default behavior
    // Your send message function
    sendMessage();
  }
});

function displayMessage(sender, content, date) {
  const dateObj = new Date(date);
  const options = {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  const formattedDate = dateObj
    .toLocaleString("en-US", options)
    .replace(", ", "|");

  const senderSpan = document.createElement("span");
  senderSpan.textContent = sender;
  senderSpan.classList.add("sender");

  const dateSpan = document.createElement("span");
  dateSpan.textContent = formattedDate;
  dateSpan.classList.add("date");

  const senderAndDateDiv = document.createElement("div");
  senderAndDateDiv.classList.add("senderAndDateDiv");
  senderAndDateDiv.appendChild(senderSpan);
  senderAndDateDiv.appendChild(dateSpan);

  const contentDiv = document.createElement("div");
  contentDiv.textContent = content;
  contentDiv.classList.add("message");

  const messageContainer = document.createElement("div");
  messageContainer.classList.add("message-container");
  messageContainer.appendChild(senderAndDateDiv);
  messageContainer.appendChild(contentDiv);

  messages.appendChild(messageContainer);
}