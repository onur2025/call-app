const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

// إنشاء التطبيق
const app = express();
const PORT = process.env.PORT || 10000;

// إعداد قاعدة البيانات
const mongoURI = 'mongodb+srv://yassinonur:fTWv5P.JaYLhfiF@chatdatabase.lwadf.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// تعريف نموذج المستخدم
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// إعداد middlewares
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// نقطة تسجيل المستخدم الجديد
app.post('/register', async (req, res) => {
  const { username, phone, password } = req.body;

  try {
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).send('Phone number already registered.');
    }

    const user = new User({ username, phone, password });
    await user.save();
    res.status(201).send('User registered successfully.');
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).send('Error registering user.');
  }
});

// نقطة تسجيل الدخول
app.post('/login', async (req, res) => {
  const { phone, password } = req.body;

  try {
    const user = await User.findOne({ phone, password });
    if (user) {
      res.status(200).send('Login successful.');
    } else {
      res.status(401).send('Invalid phone number or password.');
    }
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).send('Error during login.');
  }
});

// بدء الخادم
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
