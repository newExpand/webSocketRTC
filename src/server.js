import http from "http";
//  웹소켓을 이용한 코드
// import WebSocket from "ws";
import {Server} from "socket.io";
import express from "express";
import { instrument } from "@socket.io/admin-ui";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`http://localhost:3000`);

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
    cors: {
      origin: ["https://admin.socket.io"],
      credentials: true
    }
  });
  instrument(wsServer, {
    auth: false,
    mode: "development",
  });

function publicRoom() {
    const {
        sockets: {
            adapter : {sids, rooms}
        }
    } = wsServer;
    const publicRoom = [];
    rooms.forEach((_, key) => {
        if (sids.get(key) === undefined) {
            publicRoom.push(key);
        }
    })

    return publicRoom;
}

function countRoom(roomName) {
    const {
        sockets : {
            adapter : {rooms}
        }
    } = wsServer;


    return rooms.get(roomName)?.size;
}

wsServer.on("connection", (socket) => {
    socket["nickname"] = "익명";
    wsServer.sockets.emit("room_change", publicRoom());

    socket.onAny((e) => {
        console.log(`소켓 이벤트 : ${e}`);
    });

    socket.on("enter_room", (roomName, showRoom) => {
        socket.join(roomName);
        showRoom(countRoom(roomName));
        socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
        wsServer.sockets.emit("room_change", publicRoom());
    });

    socket.on("disconnecting", () => {
        socket.rooms.forEach((room) => socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1));
    });

    socket.on("disconnect", () => {
        wsServer.sockets.emit("room_change", publicRoom());
    });

    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", `${socket.nickname} : ${msg}`);
        done();
    });

    socket.on("nickname", nickname => socket["nickname"] = nickname)
});




















//  웹소켓을 이용한 코드
// const server = http.createServer(app);
// const wss = new WebSocket.Server({ server });

// function onSocketClose() {
//     console.log("닫힘??ㅋㅋ");
// }

// const sockets = [];

// wss.on("connection", (socket) => {
//     sockets.push(socket);
//     socket["nickname"] = "Anon";
//     console.log("갔냐?");
//     socket.on("close", onSocketClose);
//     socket.on("message", (msg) => {
//         const message = JSON.parse(msg);

//         switch (message.type) {
//             case "new_message":
//                 sockets.forEach((aSocket) => aSocket.send(`${socket.nickname} : ${message.payload}`));
//                 break;
//             case "nickname":
//                 socket["nickname"] = message.payload;
//                 break;
//         }
//     });
// });

httpServer.listen(3000, handleListen);
