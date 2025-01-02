const chatList = document.getElementById('chatList');
const messages = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendMessageBtn = document.getElementById('sendMessageBtn');

// بيانات افتراضية للمحادثات
const chats = [
  { id: 1, name: 'John Doe' },
  { id: 2, name: 'Jane Smith' }
];

// تحميل المحادثات في الشريط الجانبي
chats.forEach(chat => {
  const li = document.createElement('li');
  li.textContent = chat.name;
  li.dataset.id = chat.id;
  li.addEventListener('click', () => selectChat(chat));
  chatList.appendChild(li);
});

// عرض الرسائل
const selectChat = (chat) => {
  document.getElementById('chatHeader').textContent = chat.name;
  messages.innerHTML = ''; // إعادة تعيين الرسائل
};

// إرسال الرسائل
sendMessageBtn.addEventListener('click', () => {
  const message = messageInput.value.trim();
  if (message) {
    const div = document.createElement('div');
    div.textContent = message;
    div.style.marginBottom = '10px';
    messages.appendChild(div);
    messageInput.value = '';
  }
});
