const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const path = require('path');

const User = require('./models/User');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// اتصال MongoDB
const mongoURI = 'mongodb+srv://yassinonur:Artega%402025@chatdatabase.lwadf.mongodb.net/?retryWrites=true&w=majority&appName=chatdatabase';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});

// إدارة المستخدمين
app.post('/register', async (req, res) => {
  const { username, email, phone, password } = req.body;

  try {
    const user = new User({ username, email, phone, password });
    await user.save();
    res.status(201).send('User registered successfully');
  } catch (err) {
    res.status(500).send('Error registering user: ' + err.message);
  }
});

// إرسال رسالة
app.post('/send-message', async (req, res) => {
  const { sender, recipient, content } = req.body;

  try {
    const message = new Message({ sender, recipient, content });
    await message.save();
    res.status(201).send('Message sent successfully');
  } catch (err) {
    res.status(500).send('Error sending message');
  }
});

// استرجاع الرسائل
app.get('/messages/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const messages = await Message.find({
      $or: [{ sender: username }, { recipient: username }]
    }).sort({ timestamp: -1 });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).send('Error fetching messages');
  }
});

// البحث عن المستخدمين
app.get('/users', async (req, res) => {
  const { search } = req.query;

  try {
    const users = await User.find({
      $or: [
        { email: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') },
        { username: new RegExp(search, 'i') }
      ]
    });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).send('Error searching for users: ' + err.message);
  }
});

// Socket.IO
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });

  socket.on('send_message', (data) => {
    const { room, message } = data;
    io.to(room).emit('receive_message', message);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// تشغيل الخادم
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
