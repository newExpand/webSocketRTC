const messageList = document.querySelector("ul");
const messageForm = document.querySelector("form");

const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener("open", () => {
    console.log("연결됐음!");
});

socket.addEventListener("message", (message) => {
    console.log("문자왔숑! => ", message.data);
});

socket.addEventListener("close", () => {
    console.log("야 너 연결끊겼다ㅋㅋㅋ");
});

function handleSubmit(e) {
    e.preventDefault();
    const input = messageForm.querySelector("input");
    socket.send(input.value);
    input.value = "";
}

messageForm.addEventListener("submit", handleSubmit);
