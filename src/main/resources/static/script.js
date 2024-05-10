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
        loginContainer.style.display = "none"; //change the css display value form flex to none in order to hide it 
        mainContainer.style.display = "flex"; //change the css display value form none to flex in order to show it
    } else {
        console.log("THE USERNAME HAS TO BE AT LEAST 1 CHARACTER LONG"); 
    }
}

loginButton.addEventListener("click", changeDisplay); //show the messages on click of the login button

const websocket = new WebSocket("ws://localhost:8080/chat");

websocket.onmessage = function(event) { //event being an oncoming message 
    const message = event.data;
    displayMessage(message);
}

function displayMessage(message) {
    const messageElement = document.createElement("div"); //create a new div DOM element
    messageElement.textContent = message; //insert the text into the div
    messageElement.classList.add("message"); //add some predefined styles to the div

    messageContainer.appendChild(messageElement); //insert the message div into the message container
    messageContainer.scrollIntoView({behavior:"smooth"}); //if the container overflows, then scroll the appended message into view
}

function sendMessage() {
    let message = inputField.value; //set message as the content in the input field
    if (message !== "") { //check if the message is empty and do nothing if it is true
        websocket.send(message); //send the message trough the previously established websocket
        inputField.value = ""; //set the input field content to empty
    }
}

sendButton.addEventListener("click", sendMessage); //send a message when the send button is clicked