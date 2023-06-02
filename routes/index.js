const router = require('express').Router();
const http2 = require('http2');
const { validateToken } = require('../middlewares/auth');
const { loginValidate, signupValidate } = require('../middlewares/celebrate');
const { login, createUser } = require('../controllers/users');
const routerUser = require('./users');
const cardRouter = require('./cards');

const {
  HTTP_STATUS_NOT_FOUND,
} = http2.constants;

router.post('/signin', loginValidate, login);
router.post('/signup', signupValidate, createUser);
router.get('/signout', (req, res) => {
  res.clearCookie('jwt').send({ message: 'Exit' });
});

router.use('/users', validateToken, routerUser);
router.use('/cards', validateToken, cardRouter);
router.use('/*', validateToken, (req, res, next) => next(res.status(HTTP_STATUS_NOT_FOUND)));

module.exports = router;
