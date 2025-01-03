// البحث عن المستخدمين
document.getElementById('searchUser').addEventListener('input', (event) => {
  const query = event.target.value.toLowerCase();
  const users = document.querySelectorAll('.user-item');
  users.forEach((user) => {
    user.style.display = user.textContent.toLowerCase().includes(query) ? '' : 'none';
  });
});

// إرسال رسالة
document.getElementById('sendMessageBtn').addEventListener('click', () => {
  const messageInput = document.getElementById('messageInput');
  const message = messageInput.value.trim();
  if (message) {
    // إرسال الرسالة
    console.log(`Message sent: ${message}`);
    messageInput.value = '';
  } else {
    alert('Message cannot be empty.');
  }
});
