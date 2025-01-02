const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const users = {}; // تخزين المستخدمين المتصلين

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // تسجيل المستخدم
  socket.on('register', (userData) => {
    if (userData?.userId) {
      users[userData.userId] = socket.id;
      console.log(`User registered: ${userData.userId}`);
    } else {
      console.log('Invalid registration data:', userData);
    }
  });

  // بدء المكالمة
  socket.on('call', ({ callerId, calleeId }) => {
    if (!users[callerId]) {
      socket.emit('error', { message: 'Caller not registered.' });
      return;
    }

    const calleeSocket = users[calleeId];
    if (calleeSocket) {
      console.log(`Call initiated from ${callerId} to ${calleeId}`);
      io.to(calleeSocket).emit('incoming_call', { callerId });
      io.to(users[callerId]).emit('call_initiated', { calleeId });
    } else {
      console.log(`Callee ${calleeId} is unavailable.`);
      socket.emit('user_unavailable');
    }
  });

  // قبول المكالمة
  socket.on('accept_call', ({ callerId }) => {
    const callerSocket = users[callerId];
    if (callerSocket) {
      io.to(callerSocket).emit('redirect_to_call');
      io.to(socket.id).emit('redirect_to_call');
    }
  });

  // رفض المكالمة
  socket.on('reject_call', ({ callerId }) => {
    const callerSocket = users[callerId];
    if (callerSocket) {
      io.to(callerSocket).emit('call_rejected');
    }
  });

  // فصل المستخدم
  socket.on('disconnect', () => {
    for (const [userId, socketId] of Object.entries(users)) {
      if (socketId === socket.id) {
        delete users[userId];
        console.log(`User disconnected: ${userId}`);
        break;
      }
    }
  });
});

app.use(express.static(path.join(__dirname, 'public')));

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
