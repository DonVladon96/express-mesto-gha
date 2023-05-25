const http2 = require('http2');
const { Error } = require('mongoose');

const {
  HTTP_STATUS_CREATED,
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_NOT_FOUND,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  HTTP_STATUS_OK,
} = http2.constants;

const User = require('../models/user');

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => {
      res.send(users);
    })
    .catch(() => {
      res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Server Error' });
    });
};

// вариант из вебинара Сергея Буртылева
module.exports.getUserById = (req, res) => {
  // const { _id } = req.user;
  const _id = 123456789;
  User.findById(_id)
    .orFail()
    // eslint-disable-next-line consistent-return
    .then((user) => {
      if (!user) {
        return res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'User is not found' });
      }
      res.send(user);
    })
    .catch((err) => {
      console.log(err);
      if (err instanceof Error.CastError) {
        res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'User id is not valid.' });
        return;
      }
      if (err instanceof Error.DocumentNotFoundError) {
        res.status(HTTP_STATUS_NOT_FOUND).send({ message: 'User id is not found.' });
        return;
      }
      res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Server Error.' });
    });
};

//  добавить справки по ошибкам Mongoose ODM
module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  console.log(req.body);
  console.log(req.praktikum);
  User.create({ name, about, avatar })
    .orFail()
    .then((user) => res.status(HTTP_STATUS_CREATED).send(user))
    .catch((err) => {
      if (err instanceof Error.ValidationError) {
        res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'User data is not a create.' });
        return;
      }
      res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Server error' });
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
    .then((user) => res.status(HTTP_STATUS_OK).send(user))
    .catch((err) => {
      if (err instanceof Error.CastError) {
        res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'User data is not valid' });
        return;
      }

      if (err instanceof Error.DocumentNotFoundError) {
        res.status(HTTP_STATUS_NOT_FOUND).send({ message: 'User id is not a found' });
        return;
      }

      res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Server error.' });
    });
};

module.exports.updateAvatar = (req, res) => {
  const { avatar } = req.body || {};

  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
  )
    .orFail()
    .then((user) => res.status(HTTP_STATUS_OK).send(user))
    .catch((err) => {
      if (err instanceof Error.CastError) {
        res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'User data is not a valid' });
        return;
      }

      if (err instanceof Error.DocumentNotFoundError) {
        res.status(HTTP_STATUS_NOT_FOUND).send({ message: 'User is not a found' });
        return;
      }

      res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Server error.' });
    });
};
