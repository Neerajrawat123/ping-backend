import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import authrouter from "./auth.router.js";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from 'cookie-parser'

const app = express();
const httpServer = createServer(app);
app.use(cors());
app.use(cookieParser())

app.use(express.json());

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
  },
});
const connectedUser = {}

app.use("/api", authrouter);

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  jwt.verify(token, 'secret', (err, decoded) => {
    if (err) {
      return next(new Error('Authentication error'));
    }
    socket.username = decoded.username;
    next();
  });
});


io.on("connection", (socket) => {
  console.log("socket is connected to", socket.id);
  connectedUser[socket.username] = socket.id
  console.log(connectedUser)
  io.emit("users", Object.entries(connectedUser));

  socket.on("sendToall", (from) => {
    socket.broadcast.emit("ping", from);
  });

  socket.on("ping", (to, from) => {
    console.log(`ping is send from ${from} to ${to}`);
    io.to(to).emit("ping", from);
  });
  socket.on("disconnect", () => {
    delete connectedUser[socket.username]
    io.emit("users", Object.entries(connectedUser));
  });
});

httpServer.listen(4000, () => {
  console.log("server is listening on port 4000");
});

// things to do

// intiate a ledger for user and their socket id
// when a user joined a socket it gets a list of another active user
// or disconnect get the updated list
// on the behalf of list the user can sent the ping to individual or all the user (broadcasts users)
