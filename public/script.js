const notificationSound = new Audio('notification.mp3'); // تحميل ملف الصوت
const callLog = []; // مصفوفة لتسجيل المكالمات
let callTimeout; // لتخزين المؤقت لفصل الاتصال تلقائيًا

// دالة لإظهار الإشعارات
const showNotification = (message) => {
  console.log('Notification:', message); // سجل الإشعار
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.className = 'notification';
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 5000);
};

// الاتصال بـ Socket.IO
const socket = io('https://call-app-n3pl.onrender.com'); // رابط الخادم الخاص بك

// تسجيل المستخدم
document.getElementById('registerBtn').addEventListener('click', () => {
  const userId = document.getElementById('userId').value;
  console.log('Registering user:', userId); // سجل العملية
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
  console.log(`Calling ${callId} from ${userId}`); // سجل العملية
  if (userId && callId) {
    socket.emit('call', { callerId: userId, calleeId: callId });
    callLog.push({ type: 'Outgoing', to: callId, time: new Date().toLocaleString() });
    showNotification(`Calling ${callId}...`);
  } else {
    showNotification('Please fill in both IDs.');
  }
});

// استقبال مكالمة واردة
socket.on('incoming_call', ({ callerId, calleeId }) => {
  console.log(`Incoming call from ${callerId} to ${calleeId}`);
  const userId = document.getElementById('userId').value;

  if (userId === calleeId) {
    notificationSound.play(); // تشغيل الصوت
    showNotification(`Incoming call from: ${callerId}`);
    const callActions = document.getElementById('callActions');
    callActions.style.display = 'block';
    callActions.setAttribute('data-caller-id', callerId);

    callTimeout = setTimeout(() => {
      console.log(`Call timeout for ${callerId}`);
      socket.emit('timeout_call', { callerId });
      showNotification('Call timed out.');
      callActions.style.display = 'none';
    }, 10000);
  }
});

// قبول المكالمة
document.getElementById('acceptCallBtn').addEventListener('click', () => {
  const callActions = document.getElementById('callActions');
  const callerId = callActions.getAttribute('data-caller-id');
  console.log(`Accepting call from ${callerId}`);
  clearTimeout(callTimeout);
  sessionStorage.setItem('otherUserId', callerId);
  socket.emit('accept_call', { callerId });
  showNotification(`You accepted the call from ${callerId}.`);
  window.location.href = 'call.html';
});

// رفض المكالمة
document.getElementById('rejectCallBtn').addEventListener('click', () => {
  const callActions = document.getElementById('callActions');
  const callerId = callActions.getAttribute('data-caller-id');
  console.log(`Rejecting call from ${callerId}`);
  clearTimeout(callTimeout);
  socket.emit('reject_call', { callerId });
  showNotification(`You rejected the call from ${callerId}.`);
  callActions.style.display = 'none';
});

// استقبال حدث إعادة التوجيه إلى صفحة الاتصال
socket.on('redirect_to_call', () => {
  console.log('Redirecting to call.html'); // سجل لتأكيد استقبال الحدث
  window.location.href = 'call.html';
});

// إنهاء المكالمة عند الضغط على الزر الأحمر
document.getElementById('endCallBtn')?.addEventListener('click', () => {
  const otherUserId = sessionStorage.getItem('otherUserId');
  console.log('Ending call with:', otherUserId);
  if (otherUserId) {
    socket.emit('end_call', { otherUserId });
    showNotification('You ended the call.');
  }
  window.location.href = 'index.html';
});

// استقبال حدث إنهاء المكالمة
socket.on('call_ended', () => {
  console.log('Call ended by the other party.');
  alert('The call has been ended by the other party.');
  window.location.href = 'index.html';
});
