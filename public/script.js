// تسجيل المستخدم
document.getElementById('registerBtn').addEventListener('click', () => {
  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const password = document.getElementById('password').value.trim();

  if (username && email && password) {
    fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, phone, password })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to register user.');
        }
        return response.text();
      })
      .then(data => {
        alert(data);
        // الانتقال إلى صفحة المراسلة
        window.location.href = 'chat.html';
      })
      .catch(err => {
        console.error('Error:', err);
        alert('An error occurred during registration. Please try again.');
      });
  } else {
    alert('Please fill all required fields.');
  }
});

// إرسال رسالة
document.getElementById('sendMessageBtn').addEventListener('click', () => {
  const message = document.getElementById('messageInput').value.trim();
  if (message) {
    const room = 'general'; // مثال على اسم الغرفة
    fetch('/send-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender: 'currentUser', recipient: room, content: message })
    })
      .then(response => response.text())
      .then(data => {
        console.log('Message sent:', data);
        document.getElementById('messageInput').value = '';
      })
      .catch(err => console.error('Error sending message:', err));
  } else {
    alert('Message cannot be empty.');
  }
});

// استقبال الرسائل الحية باستخدام Socket.IO
const socket = io();
socket.on('receive_message', (message) => {
  const messagesDiv = document.getElementById('messages');
  const messageItem = document.createElement('div');
  messageItem.className = 'message';
  messageItem.textContent = message;
  messagesDiv.appendChild(messageItem);
  messagesDiv.scrollTop = messagesDiv.scrollHeight; // التمرير إلى آخر رسالة
});

// البحث عن مستخدمين في قائمة الأصدقاء
document.getElementById('searchUser').addEventListener('input', (event) => {
  const query = event.target.value.toLowerCase();
  const users = document.querySelectorAll('.user-item');
  users.forEach((user) => {
    if (user.textContent.toLowerCase().includes(query)) {
      user.style.display = '';
    } else {
      user.style.display = 'none';
    }
  });
});
