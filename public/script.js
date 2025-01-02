const notificationSound = new Audio('notification.mp3'); // تحميل ملف الصوت
const callLog = []; // مصفوفة لتسجيل المكالمات
let callTimeout; // لتخزين المؤقت لفصل الاتصال تلقائيًا

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

// الاتصال بـ Socket.IO
const socket = io('https://call-app-n3pl.onrender.com'); // رابط الخادم الخاص بك

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
  const callId = document.getElementById('callId').value; // استخدام callId بدلًا من calleeId
  if (userId && callId) {
    socket.emit('call', { callerId: userId, calleeId: callId }); // تمرير callId كـ calleeId للخادم
    callLog.push({ type: 'Outgoing', to: callId, time: new Date().toLocaleString() }); // تسجيل المكالمة الصادرة
    showNotification(`Calling ${callId}...`);
  } else {
    showNotification('Please fill in both IDs.');
  }
});

// استقبال مكالمة واردة
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

// قبول المكالمة
document.getElementById('acceptCallBtn').addEventListener('click', () => {
  const callActions = document.getElementById('callActions');
  const callerId = callActions.getAttribute('data-caller-id');

  clearTimeout(callTimeout); // إلغاء المؤقت
  sessionStorage.setItem('otherUserId', callerId); // تخزين معرف الطرف الآخر
  socket.emit('accept_call', { callerId });
  showNotification(`You accepted the call from ${callerId}.`);

  // الانتقال إلى صفحة الاتصال
  window.location.href = 'call.html';
});

// رفض المكالمة
document.getElementById('rejectCallBtn').addEventListener('click', () => {
  const callActions = document.getElementById('callActions');
  const callerId = callActions.getAttribute('data-caller-id');

  clearTimeout(callTimeout); // إلغاء المؤقت
  socket.emit('reject_call', { callerId });
  showNotification(`You rejected the call from ${callerId}.`);

  // إخفاء الأزرار بعد الرفض
  callActions.style.display = 'none';
});

// استقبال حدث إعادة التوجيه إلى صفحة الاتصال
socket.on('redirect_to_call', () => {
  window.location.href = 'call.html';
});

// إنهاء المكالمة عند الضغط على الزر الأحمر
document.getElementById('endCallBtn')?.addEventListener('click', () => {
  const otherUserId = sessionStorage.getItem('otherUserId'); // الحصول على معرف الطرف الآخر
  socket.emit('end_call', { otherUserId }); // إرسال الحدث إلى الخادم
  showNotification('You ended the call.');
  window.location.href = 'index.html'; // العودة إلى الصفحة الرئيسية
});

// استقبال حدث إنهاء المكالمة من الطرف الآخر
socket.on('call_ended', () => {
  alert('The call has been ended by the other party.');
  window.location.href = 'index.html'; // العودة إلى الصفحة الرئيسية
});

// استقبال رفض المكالمة
socket.on('call_rejected', () => {
  showNotification('The call was rejected.');
});

// عرض سجل المكالمات
document.getElementById('showLogBtn').addEventListener('click', () => {
  const logContainer = document.getElementById('callLog');
  logContainer.innerHTML = ''; // تفريغ السجل القديم
  callLog.forEach((log) => {
    const logItem = document.createElement('li');
    logItem.textContent = `${log.type} call ${log.type === 'Incoming' ? 'from' : 'to'} ${log.type === 'Incoming' ? log.from : log.to} at ${log.time}`;
    logContainer.appendChild(logItem);
  });
});
