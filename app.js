const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const router = require('./routes/index');

const app = express();
const PORT = 3006;

app.use((req, res, next) => {
  req.user = {
    _id: '646bc6f6bae88207c8e596d4', // вставьте сюда _id созданного в предыдущем пункте пользователя
  };

  next();
});

// app.use(express.static(path.join(__dirname, './')))
app.use(helmet());
app.use(express.json());
app.use(router);

mongoose.connect('mongodb://127.0.0.1:27017/mestodb').then(() => {
  console.log('Connected to database.');
}).catch((error) => {
  console.error('Error connecting to database:', error);
});

app.listen(PORT, () => {
  console.log(`Listing on ${PORT}`);
});
