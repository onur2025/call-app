const notificationSound = new Audio('notification.mp3'); // تحميل ملف الصوت
const callLog = []; // مصفوفة لتسجيل المكالمات

const showNotification = (message) => {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.className = 'notification';
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 5000);
};

const socket = io('https://call-app-n3pl.onrender.com'); // رابط الخادم الخاص بك

document.getElementById('registerBtn').addEventListener('click', () => {
  const userId = document.getElementById('userId').value;
  if (userId) {
    socket.emit('register', { userId });
    showNotification('Registered successfully!');
  } else {
    showNotification('Please enter your ID.');
  }
});

document.getElementById('callBtn').addEventListener('click', () => {
  const userId = document.getElementById('userId').value;
  const callId = document.getElementById('callId').value; // استخدام callId بدلًا من calleeId
  if (userId && callId) {
    socket.emit('call', { callerId: userId, calleeId: callId }); // تمرير callId كـ calleeId للخادم
    callLog.push({ type: 'Outgoing', to: callId, time: new Date().toLocaleString() }); // تسجيل المكالمة الصادرة
    showNotification(`Calling ${callId}...`);
  } else {
    showNotification('Please fill in both IDs.');
  }
});

socket.on('incoming_call', ({ callerId }) => {
  notificationSound.play(); // تشغيل الصوت
  showNotification(`Incoming call from: ${callerId}`);
  
  // إظهار أزرار القبول والرفض
  const callActions = document.getElementById('callActions');
  callActions.style.display = 'block';

  // تخزين معرف المتصل
  callActions.setAttribute('data-caller-id', callerId);
});

document.getElementById('acceptCallBtn').addEventListener('click', () => {
  const callActions = document.getElementById('callActions');
  const callerId = callActions.getAttribute('data-caller-id');

  socket.emit('accept_call', { callerId });
  showNotification(`You accepted the call from ${callerId}.`);

  // إخفاء الأزرار بعد القبول
  callActions.style.display = 'none';
});

document.getElementById('rejectCallBtn').addEventListener('click', () => {
  const callActions = document.getElementById('callActions');
  const callerId = callActions.getAttribute('data-caller-id');

  socket.emit('reject_call', { callerId });
  showNotification(`You rejected the call from ${callerId}.`);

  // إخفاء الأزرار بعد الرفض
  callActions.style.display = 'none';
});

document.getElementById('showLogBtn').addEventListener('click', () => {
  const logContainer = document.getElementById('callLog');
  logContainer.innerHTML = ''; // تفريغ السجل القديم
  callLog.forEach((log) => {
    const logItem = document.createElement('li');
    logItem.textContent = `${log.type} call ${log.type === 'Incoming' ? 'from' : 'to'} ${log.type === 'Incoming' ? log.from : log.to} at ${log.time}`;
    logContainer.appendChild(logItem);
  });
});

