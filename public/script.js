const notificationSound = new Audio('notification.mp3'); // تحميل ملف الصوت
const callLog = []; // مصفوفة لتسجيل المكالمات
let callTimeout; // لتخزين المؤقت لفصل الاتصال تلقائيًا

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

socket.on('incoming_call', ({ callerId, calleeId }) => {
  const userId = document.getElementById('userId').value;

  if (userId === calleeId) {
    notificationSound.play(); // تشغيل الصوت
    showNotification(`Incoming call from: ${callerId}`);
    
    // إظهار أزرار القبول والرفض فقط للمستقبل
    const callActions = document.getElementById('callActions');
    callActions.style.display = 'block';
    callActions.setAttribute('data-caller-id', callerId);

    // بدء عداد زمني لفصل المكالمة تلقائيًا بعد 10 ثوانٍ
    callTimeout = setTimeout(() => {
      socket.emit('timeout_call', { callerId });
      showNotification('Call timed out.');
      callActions.style.display = 'none'; // إخفاء الأزرار
    }, 10000); // 10 ثوانٍ
  }
});

document.getElementById('acceptCallBtn').addEventListener('click', () => {
  const callActions = document.getElementById('callActions');
  const callerId = callActions.getAttribute('data-caller-id');

  clearTimeout(callTimeout); // إلغاء المؤقت
  socket.emit('accept_call', { callerId });
  showNotification(`You accepted the call from ${callerId}.`);

  // الانتقال إلى صفحة الاتصال
  window.location.href = 'call.html';
});

document.getElementById('rejectCallBtn').addEventListener('click', () => {
  const callActions = document.getElementById('callActions');
  const callerId = callActions.getAttribute('data-caller-id');

  clearTimeout(callTimeout); // إلغاء المؤقت
  socket.emit('reject_call', { callerId });
  showNotification(`You rejected the call from ${callerId}.`);

  // إخفاء الأزرار بعد الرفض
  callActions.style.display = 'none';
});

socket.on('redirect_to_call', () => {
  window.location.href = 'call.html';
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


