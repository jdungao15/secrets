require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const PORT = process.env.PORT || 3000;
const app = express();

mongoose.connect('mongodb://localhost:27017/userDB', { useNewUrlParser: true });

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

// make the password in DB to be encrypted, using userSchema.plugin
userSchema.plugin(encrypt, {
  secret: process.env.SECRET,
  encryptedFields: ['password'],
});

const User = mongoose.model('User', userSchema);

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  const newUser = new User({
    email: req.body.username,
    password: req.body.password,
  });

  newUser.save(err => {
    if (err) {
      res.send(err);
    } else {
      res.render('secrets');
    }
  });
});

app.post('/login', (req, res) => {
  const { username } = req.body;
  const { password } = req.body;

  User.findOne({ email: username }, (err, foundUser) => {
    if (err) {
      console.log(err);
    } else if (foundUser) {
      if (foundUser.password === password) {
        res.render('secrets');
      }
    }
  });
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));