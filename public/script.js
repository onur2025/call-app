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
  const calleeId = document.getElementById('calleeId').value;
  if (userId && calleeId) {
    socket.emit('call', { callerId: userId, calleeId });
    showNotification(`Calling ${calleeId}...`);
  } else {
    showNotification('Please fill in both IDs.');
  }
});

socket.on('incoming_call', ({ callerId }) => {
  showNotification(`Incoming call from: ${callerId}`);
});
