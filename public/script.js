const notificationSound = new Audio('notification.mp3');
const callLog = [];
const socket = io('https://call-app-n3pl.onrender.com'); // الاتصال بالخادم

// دالة لإظهار الإشعارات
const showNotification = (message) => {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.className = 'notification';
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 5000);
};

// تسجيل المستخدم
document.getElementById('registerBtn').addEventListener('click', () => {
  const userId = document.getElementById('userId').value;
  if (userId) {
    socket.emit('register', { userId });
    showNotification('Registered successfully!');
  } else {
    showNotification('Please enter your ID.');
  }
});

// بدء مكالمة
document.getElementById('callBtn').addEventListener('click', () => {
  const userId = document.getElementById('userId').value;
  const callId = document.getElementById('callId').value;
  if (userId && callId) {
    socket.emit('call', { callerId: userId, calleeId: callId });
    callLog.push({ type: 'Outgoing', to: callId, time: new Date().toLocaleString() });
    showNotification(`Calling ${callId}...`);
  } else {
    showNotification('Please fill in both fields.');
  }
});

// استقبال مكالمة واردة
socket.on('incoming_call', ({ callerId, calleeId }) => {
  const userId = document.getElementById('userId').value;
  if (userId === calleeId) {
    notificationSound.play();
    showNotification(`Incoming call from ${callerId}`);
    document.getElementById('callActions').style.display = 'block';
    document.getElementById('callActions').setAttribute('data-caller-id', callerId);
  }
});

// قبول المكالمة
document.getElementById('acceptCallBtn').addEventListener('click', () => {
  const callerId = document.getElementById('callActions').getAttribute('data-caller-id');
  sessionStorage.setItem('otherUserId', callerId);
  socket.emit('accept_call', { callerId });
  window.location.href = 'call.html';
});

// رفض المكالمة
document.getElementById('rejectCallBtn').addEventListener('click', () => {
  const callerId = document.getElementById('callActions').getAttribute('data-caller-id');
  socket.emit('reject_call', { callerId });
  document.getElementById('callActions').style.display = 'none';
});

// إنهاء المكالمة
socket.on('call_ended', () => {
  showNotification('The call has been ended by the other party.');
  window.location.href = 'index.html';
});
