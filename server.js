const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { Chess } = require("chess.js");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const rooms = {};

app.use(express.static("public"));

io.on("connection", (socket) => {
  socket.on("createRoom", () => {
    const code = Math.random().toString(36).substr(2, 5).toUpperCase();
    rooms[code] = new Chess();
    socket.join(code);
    socket.emit("roomCreated", code);
  });

  socket.on("joinRoom", (code) => {
    if (rooms[code]) {
      socket.join(code);
      io.to(code).emit("startGame");
    } else {
      socket.emit("errorMsg", "Salon introuvable");
    }
  });

  socket.on("move", ({ code, move }) => {
    const game = rooms[code];
    if (!game) return;

    const result = game.move(move);
    if (result) {
      io.to(code).emit("move", move);
    }
  });
});

server.listen(3000, () => console.log("Server running"));
