const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const cookieParser = require('cookie-parser');
const router = require('./routes');

const app = express();
const PORT = 3000;

// app.use(express.static(path.join(__dirname, './')))
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(errors());
mongoose.connect('mongodb://127.0.0.1:27017/mestodb').then(() => {
  console.log('Connected to database.');
}).catch((error) => {
  console.error('Error connecting to database:', error);
});

app.use(router);

app.listen(PORT, () => {
  console.log(`Listing on ${PORT}`);
});
