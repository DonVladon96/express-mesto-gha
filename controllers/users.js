const User = require('../models/user');

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => {
      res.send(users);
    })
    .catch(() => {
      res.status(500).send({ message: 'Server Error' });
    });
};

// вариант из вебинара Сергея Буртылева
module.exports.getUserById = (req, res) => {
  const { _id } = req.user;

  User.findById(_id)
    .orFail()
    // eslint-disable-next-line consistent-return
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: 'User is not found' });
      }
      res.send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(400).send({ message: 'User id is not valid.' });
        return;
      }
      if (err.name === 'DocumentNotFoundError') {
        res.status(404).send({ message: 'User id is not found.' });
        return;
      }
      res.status(500).send({ message: 'Server Error.' });
    });
};

//  добавить справки по ошибкам Mongoose ODM
module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  console.log(req.body);
  console.log(req.praktikum);
  User.create({ name, about, avatar })
    .orFail()
    .then((user) => res.status(201).send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: 'User data is not a create.' });
        return;
      }
      res.status(500).send({ message: 'Server error' });
    });
};

module.exports.updateProfile = (req, res) => {
  const { name, about } = req.body || {};
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    {
      new: true,
      runValidators: true,
    },
  )
    .orFail()
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.message === 'CastError') {
        res.status(400).send({ message: 'User data is not valid' });
        return;
      }

      if (err.name === 'DocumentNotFoundError') {
        res.status(404).send({ message: 'User id is not a found' });
        return;
      }

      res.status(500).send({ message: 'Server error.' });
    });
};

module.exports.updateAvatar = (req, res) => {
  const { avatar } = req.body || {};

  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
  )
    .orFail()
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.message === 'CastError') {
        res.status(400).send({ message: 'User data is not a valid' });
        return;
      }

      if (err.name === 'DocumentNotFoundError') {
        res.status(404).send({ message: 'User is not a found' });
        return;
      }

      res.status(500).send({ message: 'Server error.' });
    });
};
