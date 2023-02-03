import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`http://localhost:3000`);

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

function onSocketClose() {
    console.log("닫힘??ㅋㅋ");
}

function onSocketMessage(message) {
    console.log(message.toString("utf-8"));
}

wss.on("connection", (socket) => {
    console.log("갔냐?");
    socket.on("close", onSocketClose);
    socket.on("message", onSocketMessage);
    socket.send("안뇽!@");
});

server.listen(3000, handleListen);
