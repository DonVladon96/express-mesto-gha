const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const http2 = require('http2');
const { Error } = require('mongoose');
const User = require('../models/user');

const {
  HTTP_STATUS_CREATED,
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_NOT_FOUND,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  HTTP_STATUS_OK,
  HTTP_STATUS_UNAUTHORIZED,
  HTTP_STATUS_CONFLICT,
} = http2.constants;

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User
    .findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        return next(res.status(HTTP_STATUS_UNAUTHORIZED).send({ message: 'Password or Email is not validity' }));
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return next(res.status(HTTP_STATUS_UNAUTHORIZED).send({ message: 'Password or Email is not validity' }));
          }

          const token = jwt.sign({ _id: user._id }, 'secret-person-key', { expiresIn: '7d' });
          res.cookie('jwt', token, { maxAge: 3600000 * 24 * 7, httpOnly: true, sameSite: true });

          return res.status(HTTP_STATUS_OK).send({ token });
        });
    })
    .catch(next);
};

module.exports.getUsers = (req, res, next) => {
  console.log('hello vald');
  User
    .find({})
    .then((users) => {
      res.send(users);
    })
    .catch(next);
};

// вариант из вебинара Сергея Буртылева
module.exports.getUserById = (req, res, next) => {
  let userId;

  if (req.params.id) {
    userId = req.params.id;
  } else {
    userId = req.user._id;
  }

  User
    .findById(userId)
    .orFail()
    // eslint-disable-next-line consistent-return
    .then((user) => res.status(HTTP_STATUS_OK).send(user))
    .catch((err) => {
      if (err instanceof Error.CastError) {
        return next(res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'User id is not valid.' }));
      }

      if (err instanceof Error.DocumentNotFoundError) {
        return next(res.status(HTTP_STATUS_NOT_FOUND).send({ message: 'User id is not found.' }));
      }

      return next(res);
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;

  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    .then((user) => {
      const NewUserObj = user.toObject();
      delete NewUserObj.password;
      res.status(HTTP_STATUS_CREATED).send(NewUserObj);
    })
    .catch((err) => {
      if (err.code === 11000) {
        return next((res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'User data is not valid.' })));
      }
      if (err instanceof Error.ValidationError || err.code === 11000) {
        return next((res.status(HTTP_STATUS_CONFLICT).send({ message: 'Such a user is already registered' })));
      }

      return next(err);
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
    .then((user) => res.send(user))
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
    { new: true, runValidators: true },
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
