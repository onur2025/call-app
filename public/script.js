const notificationSound = new Audio('notification.mp3'); // صوت الإشعارات
const socket = io('http://localhost:3000'); // الاتصال بالخادم

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
    showNotification(`Calling ${callId}...`);
  } else {
    showNotification('Please fill in both fields.');
  }
});

// استقبال مكالمة واردة
socket.on('incoming_call', ({ callerId }) => {
  notificationSound.play();
  showNotification(`Incoming call from ${callerId}`);
  document.getElementById('callActions').style.display = 'block';
  document.getElementById('callActions').setAttribute('data-caller-id', callerId);
});

// إشعار عند بدء الاتصال من المتصل
socket.on('call_initiated', ({ calleeId }) => {
  showNotification(`Calling ${calleeId}...`);
});

// قبول المكالمة
document.getElementById('acceptCallBtn').addEventListener('click', () => {
  const callerId = document.getElementById('callActions').getAttribute('data-caller-id');
  socket.emit('accept_call', { callerId });
});

// رفض المكالمة
document.getElementById('rejectCallBtn').addEventListener('click', () => {
  const callerId = document.getElementById('callActions').getAttribute('data-caller-id');
  socket.emit('reject_call', { callerId });
  document.getElementById('callActions').style.display = 'none';
});

// التوجيه إلى صفحة الاتصال
socket.on('redirect_to_call', () => {
  window.location.href = 'call.html';
});

// إنهاء المكالمة
socket.on('call_ended', () => {
  showNotification('The call has been ended.');
  window.location.href = 'index.html';
});
