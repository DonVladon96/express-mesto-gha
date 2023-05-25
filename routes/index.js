const router = require('express').Router();
const NotFoundError = require('../utils/constants');

const userRouter = require('./users');
const cardRouter = require('./cards');

router.use(userRouter, cardRouter, (req, res) => {
  res.status(404).send({ NotFoundError });
});
module.exports = router;
