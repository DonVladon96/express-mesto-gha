const User = require('../models/user');

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => {
      res.send(users);
    })
    .catch(() => {
      res.status(500).send({ message: 'Внутренняя ошибка сервера' });
    });
};


module.exports.getUserById = (req, res) => {
  // const { _id } = req.user

  // User.findById(_id)
  //   .orFail()
  //   .then((user) => res.send(user))
  //   .catch((err) => {
  //     if (err.name === 'CastError') {
  //       res.status(400).send({ message: 'Неверный ID.' });
  //       return;
  //     }
  //     if (err.name === 'DocumentNotFoundError') {
  //       res.status(404).send({ message: 'Пользователь не найден.' });
  //       return;
  //     }
  //     res.status(500).send({ message: 'Внутренняя ошибка сервера' });
  //   });
  console.log(req.user)
};


module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;


  User.create({ name, about, avatar })
    .then((user) => res.status(201).send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: 'Не валидные данные.' });
        return;
      }
      res.status(500).send({ message: 'Внутренняя ошибка сервера' });
    });
};