const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const users = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (username) => {
    users[socket.id] = username;
    io.emit('userList', Object.values(users));
    io.emit('message', {
      user: 'System',
      text: `${username} joined the chat!`,
      time: new Date().toLocaleTimeString(),
      type: 'system'
    });
  });

  socket.on('message', (data) => {
    if (!users[socket.id]) return;
    io.emit('message', {
      user: users[socket.id],
      text: data.text,
      time: new Date().toLocaleTimeString(),
      type: 'user'
    });
  });

  socket.on('disconnect', () => {
    const username = users[socket.id];
    delete users[socket.id];
    io.emit('userList', Object.values(users));
    if (username) {
      io.emit('message', {
        user: 'System',
        text: `${username} left the chat.`,
        time: new Date().toLocaleTimeString(),
        type: 'system'
      });
    }
  });
});

server.listen(3001, () => {
  console.log('TalkEasy server running on port 3001');
});