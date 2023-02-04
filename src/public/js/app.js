const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

const call = document.getElementById("call");

call.hidden = true;

let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;

async function getCameras() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === "videoinput");
        const currentCamera = myStream.getVideoTracks()[0];
        cameras.forEach(camera => {
            const option = document.createElement("option");
            option.value = camera.deviceId;
            option.innerText = camera.label;
            if (currentCamera.label === camera.label) {
                option.selected = true;
            }
            camerasSelect.appendChild(option)
        })
    } catch(e) {
        console.log(e)
    }
}

async function getMedia(deviceId) {
    const initialConstrains = {
        audio: true,
        video: {facingMode: "user"}
    }
    const cameraConstrains = {
        audio: true,
        video: {deviceId: {exact: deviceId}}
    }
    try {
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId ? cameraConstrains : initialConstrains
        );
        myFace.srcObject = myStream;
        if (!deviceId) {
            await getCameras();
        }
    } catch(e) {
        console.log(e);
    }
}


function handleMuteClick() {
    myStream
    .getAudioTracks()
    .forEach(track => track.enabled = !track.enabled);
    if(!muted) {
        muteBtn.innerText = "소리";
        muted = true;
    } else {
        muteBtn.innerText = "음소거";
        muted = false;
    }
}
function handleCameraClick() {
    myStream
        .getVideoTracks()
        .forEach(track => track.enabled = !track.enabled);
    if(!cameraOff) {
        cameraBtn.innerText = "카메라 켜기";
        cameraOff = true;
    } else {
        cameraBtn.innerText = "카메라 끄기";
        cameraOff = false;
    }
}

async function handleCameraChange() {
   await getMedia(camerasSelect.value);
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange)


const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

async function initCall() {
    welcome.hidden = true;
    call.hidden = false;
    await getMedia();
    makeConnection();
}

async function handleWelcomeSubmit(e) {
    e.preventDefault();
    const input = welcomeForm.querySelector("input");
    await initCall();
    socket.emit("join_room", input.value);
    roomName = input.value;
    input.value = "";
}


welcomeForm.addEventListener("submit", handleWelcomeSubmit)



socket.on("welcome", async () => {
    const offer = await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer);
    socket.emit("offer", offer, roomName);
})

socket.on("offer", async (offer) => {
    myPeerConnection.setRemoteDescription(offer);
    const answer = await myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(answer);
    socket.emit("answer", answer, roomName)
})

socket.on("answer", answer => {
    myPeerConnection.setRemoteDescription(answer);
})

socket.on("ice", ice => {
    myPeerConnection.addIceCandidate(ice);
})


function makeConnection() {
    myPeerConnection = new RTCPeerConnection();
    myPeerConnection.addEventListener("icecandidate", handleIce);
    myPeerConnection.addEventListener("addstream", handleAddStream)
    myStream.getTracks().forEach(track => myPeerConnection.addTrack(track, myStream));
}

function handleIce(data) {
    socket.emit("ice", data.candidate, roomName);
}


function handleAddStream(data) {
    const peerFace = document.getElementById("peerFace");
    peerFace.srcObject = data.stream;
}
















// socket.io 공부한 부분
// const socket = io();
// const welcome = document.getElementById("welcome");
// const form = welcome.querySelector("form");
// const room = document.getElementById("room");

// room.hidden = true;

// let roomName;

// function addMessage(message) {
//     const ul = room.querySelector("ul");
//     const li = document.createElement("li");
//     li.innerText = message;
//     ul.append(li);
// }

// function handleMessageSubmit(e) {
//     e.preventDefault();
//     const input = room.querySelector("#msg input");
//     const value = input.value;
//     socket.emit("new_message", input.value, roomName, () => {
//         addMessage(`당신 : ${value}`)
//     });
//     input.value = "";
// }

// function handleNicknameSubmit(e) {
//     e.preventDefault();
//     const input = room.querySelector("#name input");
//     socket.emit("nickname", input.value);
// }

// function showRoom(newCount) {
//     welcome.hidden = true;
//     room.hidden = false;
//     const h3 = room.querySelector("h3");
//     h3.innerText = `방 ${roomName} (${newCount})`;
    
//     const msgForm = room.querySelector("#msg");
//     const nameForm = room.querySelector("#name");
//     msgForm.addEventListener("submit", handleMessageSubmit);
//     nameForm.addEventListener("submit", handleNicknameSubmit);
// }

// function handleRoomSubmit(e) {
//     e.preventDefault();
//     const input = form.querySelector("input");
//     socket.emit("enter_room", 
//     input.value,
//     showRoom,
//     );
//     roomName = input.value;
//     input.value = "";
// }

// form.addEventListener("submit", handleRoomSubmit);

// socket.on("welcome", (user, newCount) => {
//     const h3 = room.querySelector("h3");
//     h3.innerText = `방 ${roomName} (${newCount})`;
//     addMessage(`${user}님이 방에 입장했습니다.`)
// })

// socket.on("bye", (left, newCount) => {
//     const h3 = room.querySelector("h3");
//     h3.innerText = `방 ${roomName} (${newCount})`;
//     addMessage(`${left} 님이 방을 나갔습니다.`)
// })

// socket.on("new_message", addMessage);

// socket.on("room_change", rooms => {
//     const roomList = welcome.querySelector("ul");
//     roomList.innerText = "";
//     rooms.forEach(room => {
//         const li = document.createElement("li");
//         li.innerText = room;
//         roomList.append(li);
//     })
// });
























// 웹소켓으로 했을때 코드
// const messageList = document.querySelector("ul");
// const nickForm = document.querySelector("#nick");
// const messageForm = document.querySelector("#message");
// const socket = new WebSocket(`ws://${window.location.host}`);

// function makeMessage(type, payload) {
//     const msg = { type, payload };
//     return JSON.stringify(msg);
// }

// socket.addEventListener("open", () => {
//     console.log("연결됐음!");
// });

// socket.addEventListener("message", (message) => {
//     const li = document.createElement("li");
//     li.innerText = message.data;
//     messageList.append(li);
// });

// socket.addEventListener("close", () => {
//     console.log("야 너 연결끊겼다ㅋㅋㅋ");
// });

// function handleSubmit(e) {
//     e.preventDefault();
//     const input = messageForm.querySelector("input");
//     socket.send(makeMessage("new_message", input.value));
//     input.value = "";
// }

// function handleNickSubmit(e) {
//     e.preventDefault();
//     const input = nickForm.querySelector("input");
//     socket.send(makeMessage("nickname", input.value));
//     input.value = "";
// }

// messageForm.addEventListener("submit", handleSubmit);
// nickForm.addEventListener("submit", handleNickSubmit);
