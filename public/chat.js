// البحث عن المستخدمين
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

// إرسال رسالة
document.getElementById('sendMessageBtn').addEventListener('click', () => {
  const messageInput = document.getElementById('messageInput');
  const message = messageInput.value.trim();
  if (message) {
    // إرسال الرسالة إلى الخادم
    fetch('/send-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: message })
    })
      .then(response => response.text())
      .then(data => {
        const messagesDiv = document.getElementById('messages');
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.textContent = message;
        messagesDiv.appendChild(messageElement);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        messageInput.value = '';
      })
      .catch(err => console.error('Error sending message:', err));
  } else {
    alert('Message cannot be empty.');
  }
});

