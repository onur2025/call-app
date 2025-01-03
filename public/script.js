// دالة لإظهار الإشعارات داخل التطبيق
const showNotification = (message, isError = false) => {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.className = 'notification';
  if (isError) {
    notification.classList.add('error');
  }
  notification.style.display = 'block';

  // إخفاء الإشعار بعد 5 ثوانٍ
  setTimeout(() => {
    notification.style.display = 'none';
  }, 5000);
};

// تسجيل مستخدم جديد
document.getElementById('registerBtn').addEventListener('click', () => {
  const username = document.getElementById('username').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const password = document.getElementById('password').value.trim();

  if (username && phone && password) {
    fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, phone, password })
    })
      .then(response => response.text())
      .then(data => {
        showNotification(data);
        window.location.href = 'chat.html'; // الانتقال لصفحة المراسلة
      })
      .catch(err => {
        console.error('Error:', err);
        showNotification('An error occurred during registration.', true);
      });
  } else {
    showNotification('Please fill all fields.', true);
  }
});

// تسجيل الدخول
document.getElementById('loginBtn').addEventListener('click', () => {
  const phone = document.getElementById('loginPhone').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  if (phone && password) {
    fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password })
    })
      .then(response => {
        if (!response.ok) throw new Error('Invalid login credentials');
        return response.text();
      })
      .then(data => {
        showNotification(data);
        window.location.href = 'chat.html'; // الانتقال لصفحة المراسلة
      })
      .catch(err => {
        console.error('Error:', err);
        showNotification('Invalid phone number or password.', true);
      });
  } else {
    showNotification('Please fill all fields.', true);
  }
});
