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
    users[userData.userId] = socket.id;
    console.log('User registered:', userData);
  });

  // بدء الاتصال
  socket.on('call', ({ callerId, calleeId }) => {
    console.log(`Call initiated by ${callerId} to ${calleeId}`);
    const calleeSocket = users[calleeId];
    if (calleeSocket) {
      console.log(`Notifying ${calleeId} of incoming call from ${callerId}`);
      io.to(calleeSocket).emit('incoming_call', { callerId, calleeId });
    } else {
      console.log(`User ${calleeId} is unavailable`);
      socket.emit('user_unavailable');
    }
  });

  // قبول المكالمة
  socket.on('accept_call', ({ callerId }) => {
    console.log(`Call accepted by ${socket.id} for caller ${callerId}`);
    const callerSocket = users[callerId];
    if (callerSocket) {
      console.log(`Notifying ${callerId} to redirect to call.html`);
      io.to(callerSocket).emit('redirect_to_call');
    } else {
      console.log(`Caller ${callerId} is not connected.`);
    }
  });

  // رفض المكالمة
  socket.on('reject_call', ({ callerId }) => {
    console.log(`Call rejected by ${socket.id} for caller ${callerId}`);
    const callerSocket = users[callerId];
    if (callerSocket) {
      console.log(`Notifying ${callerId} that call was rejected`);
      io.to(callerSocket).emit('call_rejected');
    }
  });

  // إنهاء المكالمة
  socket.on('end_call', ({ otherUserId }) => {
    console.log(`End call event received. Other user ID: ${otherUserId}`);
    const otherUserSocket = users[otherUserId];
    if (otherUserSocket) {
      console.log(`Notifying user ${otherUserId} about call ended.`);
      io.to(otherUserSocket).emit('call_ended');
    } else {
      console.log(`User ${otherUserId} not found or disconnected.`);
      socket.emit('user_unavailable', { message: 'The other user is not available.' });
    }
  });

  // عند فصل المستخدم
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    for (const [userId, socketId] of Object.entries(users)) {
      if (socketId === socket.id) {
        console.log(`Removing user ${userId} due to disconnection.`);
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
