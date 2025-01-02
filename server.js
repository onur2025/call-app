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

  // تسجيل الأحداث العامة للتنقيح
  socket.onAny((eventName, ...args) => {
    console.log(`Event: ${eventName}, Data:`, args);
  });

  // تسجيل المستخدم
  socket.on('register', (userData) => {
    if (userData?.userId) {
      users[userData.userId] = socket.id;
      console.log(`User registered: ${userData.userId}`);
    } else {
      console.log('Invalid registration data:', userData);
      socket.emit('error', { message: 'Invalid registration data.' });
    }
  });

  // بدء الاتصال
  socket.on('call', ({ callerId, calleeId }) => {
    if (!users[callerId]) {
      console.log(`Caller ${callerId} is not registered.`);
      socket.emit('error', { message: 'Caller not registered.' });
      return;
    }

    const calleeSocket = users[calleeId];
    if (calleeSocket) {
      console.log(`Call initiated by ${callerId} to ${calleeId}`);
      io.to(calleeSocket).emit('incoming_call', { callerId, calleeId });

      // إضافة مهلة زمنية
      const timeout = setTimeout(() => {
        console.log(`Call timeout: ${calleeId} did not respond.`);
        io.to(users[callerId]).emit('call_timeout', { calleeId });
      }, 30000); // 30 ثانية

      // إلغاء المهلة إذا تم قبول المكالمة أو رفضها
      socket.on('accept_call', ({ callerId: acceptCallerId }) => {
        if (acceptCallerId === callerId) clearTimeout(timeout);
      });

      socket.on('reject_call', ({ callerId: rejectCallerId }) => {
        if (rejectCallerId === callerId) clearTimeout(timeout);
      });
    } else {
      console.log(`Callee ${calleeId} is not available.`);
      socket.emit('user_unavailable');
    }
  });

  // قبول المكالمة
  socket.on('accept_call', ({ callerId }) => {
    const callerSocket = users[callerId];
    if (callerSocket) {
      console.log(`Call accepted by ${socket.id} for caller ${callerId}`);
      io.to(callerSocket).emit('redirect_to_call');
    } else {
      console.log(`Caller ${callerId} is not available.`);
      socket.emit('error', { message: 'Caller not available.' });
    }
  });

  // رفض المكالمة
  socket.on('reject_call', ({ callerId }) => {
    const callerSocket = users[callerId];
    if (callerSocket) {
      console.log(`Call rejected by ${socket.id} for caller ${callerId}`);
      io.to(callerSocket).emit('call_rejected');
    } else {
      console.log(`Caller ${callerId} is not available.`);
      socket.emit('error', { message: 'Caller not available.' });
    }
  });

  // إنهاء المكالمة
  socket.on('end_call', ({ otherUserId }) => {
    const otherUserSocket = users[otherUserId];
    if (otherUserSocket) {
      console.log(`Call ended by ${socket.id} for user ${otherUserId}`);
      io.to(otherUserSocket).emit('call_ended');
      io.to(socket.id).emit('call_ended'); // إشعار المستخدم الذي أنهى المكالمة
    } else {
      console.log(`User ${otherUserId} is not available to end the call.`);
      socket.emit('error', { message: 'The other user is not available to end the call.' });
    }
  });

  // فصل المستخدم
  socket.on('disconnect', () => {
    for (const [userId, socketId] of Object.entries(users)) {
      if (socketId === socket.id) {
        console.log(`User ${userId} disconnected.`);
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
