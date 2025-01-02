document.getElementById('registerBtn').addEventListener('click', () => {
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const password = document.getElementById('password').value;

  if (username && email && password) {
    fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, phone, password })
    })
      .then(response => response.text())
      .then(data => alert(data))
      .catch(err => console.error('Error:', err));
  } else {
    alert('Please fill all required fields.');
  }
});
