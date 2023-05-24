const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Поле name обязательно к заполнению.'],
      minlength: [2, 'Минимальная длинна поля - 2 символа.'],
      maxlength: [30, 'Максимальная длинна поля - 30 символов.'],
    },
    about: {
      type: String,
      required: [true, 'Поле name обязательно к заполнению.'],
      minlength: [2, 'Минимальная длинна поля - 2 символа.'],
      maxlength: [30, 'Максимальная длинна поля - 30 символов.'],
    },
    avatar: {
      type: String,
      required: [true, 'Поле name обязательно к заполнению.'],
    },
  },
);

module.exports = mongoose.model('user', userSchema);
