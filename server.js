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
  const { username, password } = req.body;

  try {
    const user = new User({ username, password });
    await user.save();
    res.status(201).send('User registered successfully');
  } catch (err) {
    res.status(500).send('Error registering user');
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

// Socket.IO
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('send_message', (data) => {
    io.to(data.recipient).emit('receive_message', data);
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
