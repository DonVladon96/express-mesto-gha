const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const http2 = require('http2');
const { Error } = require('mongoose');
const User = require('../models/user');
const {
  ErrorUnauthorized,
  NotFoundError404,
  BadRequestError,
  ConflictError,
} = require('../utils/errors');

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
        return next(new ErrorUnauthorized('Password or Email is not validity'));
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return next(new ErrorUnauthorized('Password or Email is not validity'));
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
      if (err.name === 'CastError') {
        return next(new NotFoundError404('User ID is not found'));
      }

      if (err.name === 'DocumentNotFoundError') {
        return next(new BadRequestError(`User Id: ${userId} is not found`));
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
        return next(new ConflictError('A user with such an email address has already been registered before'));
      }

      if (err.name === 'ValidationError') {
        return next(new NotFoundError404('Create User data is not validity'));
      }

      return next(err);
    });
};

module.exports.updateProfile = (req, res, next) => {
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
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        return next(new NotFoundError404('User id is not validity'));
      }

      return next(err);
    });
};

module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body || {};

  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    { new: true, runValidators: true },
  )
    .then((user) => res.status(HTTP_STATUS_OK).send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new NotFoundError404('User id is not validity'));
      }

      if (err.name === 'DocumentNotFoundError') {
        return next(new BadRequestError(`User Id: ${req.user._id} is not found`));
      }

      return next(err);
    });
};
