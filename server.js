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
      io.to(calleeSocket).emit('incoming_call', { callerId, calleeId });
    } else {
      socket.emit('user_unavailable');
    }
  });

  // قبول المكالمة
  socket.on('accept_call', ({ callerId }) => {
    const callerSocket = users[callerId];
    if (callerSocket) {
      io.to(callerSocket).emit('redirect_to_call');
      io.to(socket.id).emit('redirect_to_call'); // توجيه المستقبل أيضًا
    }
  });

  // رفض المكالمة
  socket.on('reject_call', ({ callerId }) => {
    const callerSocket = users[callerId];
    if (callerSocket) {
      io.to(callerSocket).emit('call_rejected');
    }
  });

  // إنهاء المكالمة
  socket.on('end_call', ({ otherUserId }) => {
    const otherUserSocket = users[otherUserId];
    if (otherUserSocket) {
      io.to(otherUserSocket).emit('call_ended');
      io.to(socket.id).emit('call_ended');
    }
  });

  // فصل المستخدم
  socket.on('disconnect', () => {
    for (const [userId, socketId] of Object.entries(users)) {
      if (socketId === socket.id) {
        delete users[userId];
        break;
      }
    }
  });
});

app.use(express.static(path.join(__dirname, 'public')));

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
