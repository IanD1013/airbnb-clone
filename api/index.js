const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = 'secret';

app.use(express.json());
app.use(cors({ credentials: true, origin: 'http://localhost:5173' }));

mongoose.connect(process.env.MONGO_URL);

app.get('/test', (req, res) => {
  res.json('Hello World');
});

// Register route
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userDoc = await User.create({ name, email, password: bcrypt.hashSync(password, bcryptSalt) });
    res.json(userDoc);
  } catch (error) {
    res.status(422).json(error);
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const userDoc = await User.findOne({ email });
  if (userDoc) {
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
      jwt.sign({ email: userDoc.email, id: userDoc._id }, jwtSecret, {}, (error, token) => {
        if (error) throw error;
        res.cookie('token', token).json('pass ok');
      });
    } else {
      res.status(422).json('pass not ok');
    }
  } else {
    res.json('not found');
  }
});

app.listen(4000, () => {
  console.log('Server is running on port 4000');
});
