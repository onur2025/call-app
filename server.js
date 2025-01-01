const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const users = {}; // تخزين المستخدمين المتصلين

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // تسجيل المستخدم
  socket.on('register', (userData) => {
    users[userData.userId] = socket.id;
    console.log('User registered:', userData);
  });

  // بدء الاتصال
  socket.on('call', ({ callerId, calleeId }) => {
    const calleeSocket = users[calleeId];
    if (calleeSocket) {
      io.to(calleeSocket).emit('incoming_call', { callerId });
    } else {
      socket.emit('user_unavailable');
    }
  });

  // عند فصل المستخدم
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    for (const [userId, socketId] of Object.entries(users)) {
      if (socketId === socket.id) {
        delete users[userId];
        break;
      }
    }
  });
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
