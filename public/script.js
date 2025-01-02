const notificationSound = new Audio('notification.mp3'); // صوت الإشعارات
const callLog = []; // سجل المكالمات
let callTimeout; // مؤقت المكالمة

const socket = io('https://call-app-n3pl.onrender.com'); // الاتصال بالخادم

// تسجيل المستخدم
document.getElementById('registerBtn').addEventListener('click', () => {
  const userId = document.getElementById('userId').value;
  if (userId) {
    socket.emit('register', { userId });
    alert('Registered successfully!');
  }
});

// بدء مكالمة
document.getElementById('callBtn').addEventListener('click', () => {
  const userId = document.getElementById('userId').value;
  const callId = document.getElementById('callId').value;
  if (userId && callId) {
    socket.emit('call', { callerId: userId, calleeId: callId });
    callLog.push({ type: 'Outgoing', to: callId, time: new Date().toLocaleString() });
  }
});

// استقبال مكالمة واردة
socket.on('incoming_call', ({ callerId, calleeId }) => {
  const userId = document.getElementById('userId').value;
  if (userId === calleeId) {
    notificationSound.play();
    document.getElementById('callActions').style.display = 'block';
    document.getElementById('callActions').setAttribute('data-caller-id', callerId);
    callTimeout = setTimeout(() => {
      socket.emit('timeout_call', { callerId });
      document.getElementById('callActions').style.display = 'none';
    }, 10000);
  }
});

// قبول المكالمة
document.getElementById('acceptCallBtn').addEventListener('click', () => {
  const callerId = document.getElementById('callActions').getAttribute('data-caller-id');
  clearTimeout(callTimeout);
  sessionStorage.setItem('otherUserId', callerId);
  socket.emit('accept_call', { callerId });
  window.location.href = 'call.html';
});

// رفض المكالمة
document.getElementById('rejectCallBtn').addEventListener('click', () => {
  const callerId = document.getElementById('callActions').getAttribute('data-caller-id');
  clearTimeout(callTimeout);
  socket.emit('reject_call', { callerId });
  document.getElementById('callActions').style.display = 'none';
});

// استقبال حدث إعادة التوجيه إلى المكالمة
socket.on('redirect_to_call', () => {
  window.location.href = 'call.html';
});

// إنهاء المكالمة
socket.on('call_ended', () => {
  alert('The call has been ended by the other party.');
  window.location.href = 'index.html';
});
