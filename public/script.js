
const notificationSound = new Audio('notification.mp3'); // تحميل ملف الصوت
const callLog = []; // مصفوفة لتسجيل المكالمات

const showNotification = (message) => {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.backgroundColor = '#007bff';
  notification.style.color = '#fff';
  notification.style.padding = '10px';
  notification.style.marginTop = '10px';
  notification.style.borderRadius = '4px';
  notification.style.textAlign = 'center';
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
  callLog.push({ type: 'Incoming', from: callerId, time: new Date().toLocaleString() }); // تسجيل المكالمة الواردة
  showNotification(`Incoming call from: ${callerId}`);
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
