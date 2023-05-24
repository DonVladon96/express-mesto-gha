const router = require('express').Router();

const userRouter = require('./users');
const cardRouter = require('./cards');

router.use(userRouter, cardRouter, (req, res) => {
  res.status(404).send({ message: '404 Not Found' });
});
module.exports = router;
