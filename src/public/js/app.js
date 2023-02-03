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

setTimeout(() => {
    socket.send("나 브라우전데 너 뉘기야?");
}, 10000);
