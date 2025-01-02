const socket = io('http://localhost:3000');

document.getElementById('registerBtn').addEventListener('click', () => {
  const userId = document.getElementById('userId').value;
  if (userId) {
    socket.emit('register', { userId });
    alert('Registered successfully!');
  }
});

document.getElementById('callBtn').addEventListener('click', () => {
  const userId = document.getElementById('userId').value;
  const callId = document.getElementById('callId').value;
  if (userId && callId) {
    socket.emit('call', { callerId: userId, calleeId: callId });
  }
});

socket.on('incoming_call', ({ callerId }) => {
  document.getElementById('callActions').style.display = 'block';
  document.getElementById('callActions').setAttribute('data-caller-id', callerId);
});

document.getElementById('acceptCallBtn').addEventListener('click', () => {
  const callerId = document.getElementById('callActions').getAttribute('data-caller-id');
  socket.emit('accept_call', { callerId });
  sessionStorage.setItem('otherUserId', callerId);
  window.location.href = 'call.html';
});

document.getElementById('rejectCallBtn').addEventListener('click', () => {
  const callerId = document.getElementById('callActions').getAttribute('data-caller-id');
  socket.emit('reject_call', { callerId });
  document.getElementById('callActions').style.display = 'none';
});

socket.on('call_ended', () => {
  alert('The call has been ended.');
  window.location.href = 'index.html';
});
