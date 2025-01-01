const socket = io('https://call-app-n3pl.onrender.com'); // رابط الخادم الخاص بك

document.getElementById('registerBtn').addEventListener('click', () => {
  const userId = document.getElementById('userId').value;
  if (userId) {
    socket.emit('register', { userId });
    alert('Registered successfully!');
  } else {
    alert('Please enter your ID.');
  }
});

document.getElementById('callBtn').addEventListener('click', () => {
  const userId = document.getElementById('userId').value;
  const calleeId = document.getElementById('calleeId').value;
  if (userId && calleeId) {
    socket.emit('call', { callerId: userId, calleeId });
    alert(`Calling ${calleeId}...`);
  } else {
    alert('Please fill in both IDs.');
  }
});

socket.on('incoming_call', ({ callerId }) => {
  alert(`Incoming call from: ${callerId}`);
});
