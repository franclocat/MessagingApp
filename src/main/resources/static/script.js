const loginContainer = document.querySelector(".login-container");
const inputUsername = document.querySelector("#input-username");
const sendUsernameButton = document.querySelector("#send-username-btn");

const appContainer = document.querySelector("#app");
const usersContainer = document.querySelector("#users");
const chatContainer = document.querySelector(".container");
const messages = document.querySelector("#messages");

const inputMessage = document.querySelector("#input-msg");
const sendMessageButton = document.querySelector("#send-msg-btn");

let stompClient = null;
let username = null;

window.addEventListener('beforeunload', function (event) {
    fetch("http://localhost:8080/message/deleteAll", {
        method: "DELETE"
    })
    .then(response => response.json())
    .then(jsonResponse => console.error(jsonResponse))
    .catch(error => console.error(error));
});

function changeDisplay() {
    username = inputUsername.value;
    if (username !== "") {
        loginContainer.style.display = "none";
        appContainer.style.display = "flex";
        console.log("Username: " + username);
        connectWebSocket();
    }
}

function updateUserList(onlineUsers) {
    usersContainer.innerHTML = ''; // Clear existing users
    for (const sessionId in onlineUsers) {
        const user = onlineUsers[sessionId];
        if (user != username) {
            const userDiv = document.createElement('div');
            userDiv.id = sessionId;
            userDiv.classList.add('user');
            userDiv.textContent = user;
            userDiv.onclick = emptyChatContainer;
            usersContainer.appendChild(userDiv);
        }
    }
}

function fetchPreviousMessages() {
    fetch("http://localhost:8080/message/getAll")
    .then(response => response.json())
    .then(messages => {
        messages.forEach(element => {
            displayMessage(element.sender, element.content, element.sentAt);
        });
    })
    .catch(error => console.error(error));
}

function connectWebSocket() {
    const socket = new WebSocket("ws://localhost:8080/chat");
    stompClient = Stomp.over(socket);

    fetchPreviousMessages();

    const headers = {username : username}

    stompClient.connect(headers, (frame) => {
        console.log("Connected: " + frame);

        stompClient.subscribe("/topic/public", (message) => {
            const parsedMessage = JSON.parse(message.body);
            displayMessage(parsedMessage.sender, parsedMessage.content, parsedMessage.sentAt);
        });

        stompClient.subscribe("/topic/onlineUsers", (message) => {
            const users = JSON.parse(message.body);
            console.log("Online users: ", users);
            updateUserList(users);
            console.log(usersContainer);
        }, headers);

    }, (error) => {
        console.error("Error with websocket", error);
    });
}

function inputValidation() {
    const messageContent = inputMessage.value;
    return username !== "" && messageContent !== "";
}

function sendMessage() {
    const messageContent = inputMessage.value;
    const sentAt = new Date().toISOString();

    if (inputValidation()) {
        const message = {
            sender: username,
            content: messageContent,
            sentAt: sentAt
        };

        stompClient.send("/app/public", {}, JSON.stringify(message));
    } else {
        console.log("The message content can't be empty.");
    }
}

function displayMessage(sender, content, date) {
    const dateObj = new Date(date);
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    const formattedDate = dateObj.toLocaleString('en-US', options).replace(', ', '|');

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
    inputMessage.value = "";
}

function emptyChatContainer() {
    chatContainer.innerHTML = "";
}