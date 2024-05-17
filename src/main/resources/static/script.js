const loginContainer = document.querySelector(".login-container");
const inputUsername = document.querySelector("#input-username");
const sendUsernameButton = document.querySelector("#send-username-btn");

const chatContainer = document.querySelector(".container");
const messages = document.querySelector("#messages");

const inputMessage = document.querySelector("#input-msg");
const sendMessageButton = document.querySelector("#send-msg-btn");
let websocket = null;
let username = null;

function changeDisplay() {
    loginContainer.style.display = "none";
    chatContainer.style.display = "flex";
    username = inputUsername.value;
    console.log("Username: " + username);
    connectWebSocket();
}

function connectWebSocket() {
    websocket = new WebSocket("ws://localhost:8080/chat");//change to port 28852 when testing

    websocket.onopen = function(event) {
        console.log("WebSocket connection established");
    };

    websocket.onmessage = function(event) {
        const message = JSON.parse(event.data);
        const sender = message.sender;
        const content = message.content;
        const date = message.date;
        displayMessage(sender, content, date);
    };

    websocket.onerror = function(event) {
        console.error("WebSocket error observed:", event);
    };

    websocket.onclose = function(event) {
        console.log("WebSocket connection closed");
    };
}

function sendMessage() {
    const messageContent = inputMessage.value
    const dateTime = new Date().toISOString();
    const messageObject = {
        sender: username,
        content: messageContent,
        date: dateTime
    };

    const jsonMessage = JSON.stringify(messageObject);

    if (websocket && websocket.readyState == WebSocket.OPEN) {
        websocket.send(jsonMessage);
        inputMessage.value = "";
    } else {
        alert("The message could'nt be sent because the websocket is not open");
    }
}

function displayMessage(sender, content, date) {
    console.log(`Displaying message from ${sender} at ${date}`);
    const senderSpan = document.createElement("span");
    senderSpan.textContent = sender;
    senderSpan.classList.add("sender");

    const dateSpan = document.createElement("span");
    dateSpan.textContent = date;
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

