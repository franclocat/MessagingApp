const messageContainer = document.querySelector("#messages");
const inputField = document.querySelector("#input-msg");
const sendButton = document.querySelector("#send-msg-btn");

const loginButton = document.querySelector("#send-username-btn");
const usernameField = document.querySelector("#input-username");
const mainContainer = document.querySelector(".container");
const loginContainer = document.querySelector(".login-container");
let username = "";

function changeDisplay() {
    if (usernameField.value !== "") {
        username = usernameField.value; //get the username from the login input field if the value is not empty
        console.log("Chosen username: " + username);
        loginContainer.style.display = "none"; //change the css display value form flex to none in order to hide it 
        mainContainer.style.display = "flex"; //change the css display value form none to flex in order to show it
    } else {
        console.log("THE USERNAME HAS TO BE AT LEAST 1 CHARACTER LONG"); 
    }
}

loginButton.addEventListener("click", changeDisplay); //show the messages on click of the login button

const websocket = new WebSocket("ws://localhost:8080/chat");

websocket.onmessage = function(event) { //event being an oncoming message 
    const message = JSON.parse(event.data);
    const sender = message.sender;
    const messageContent = message.content;
    
    displayMessage(sender, messageContent);
}

function displayMessage(sender, message) {
    const messageElement = document.createElement("div"); //create a new div DOM element
    messageElement.classList.add("message"); //add some predefined styles to the div

    const senderDiv = document.createElement("div");
    senderDiv.textContent = sender; //set the sender div text to the sender given as a parameter
    senderDiv.classList.add("sender"); //add style to the sender
    messageElement.appendChild(senderDiv);//append the sender to the message div

    const textDiv = document.createElement("div");
    textDiv.textContent = message; //insert the message content into the div
    messageElement.appendChild(textDiv);//append the message content to the message div

    messageContainer.appendChild(messageElement); //insert the message div into the message container
    messageContainer.scrollIntoView({behavior:"smooth"}); //if the container overflows, then scroll the appended message into view
}

function sendMessage() {
    if (inputField.value !== "") {
        const messageContent = inputField.value;
        const date = new Date().toISOString();
        console.log(date);
        //Create a JS object that has the attributes of the Message class defined in the backend
        const message = {
            sender: username,
            content: messageContent,
            createdAt: date
        };

        console.log("JS Object created: " + message);

        const jsonMessage = JSON.stringify(message); //Convert the Message object to a JSON String
        console.log("The JSON has been created: " + jsonMessage);

        websocket.send(jsonMessage); //send the message as json trough the previously established websocket
        console.log("The message has been sent trough the websocket!");
        
        inputField.value = ""; //set the input field content to empty
    }
}

sendButton.addEventListener("click", sendMessage); //send a message when the send button is clicked