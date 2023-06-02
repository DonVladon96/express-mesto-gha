const jwt = require('jsonwebtoken');
const http2 = require('http2');

const { HTTP_STATUS_UNAUTHORIZED } = http2.constants;

module.exports.validateToken = (req, res, next) => {
  const token = req.cookies.jwt;
  let payload;

  try {
    payload = jwt.verify(token, 'secret-person-key');
    console.log(payload);
  } catch (err) {
    return next(res.status(HTTP_STATUS_UNAUTHORIZED).send({ message: 'Authorization required' }));
  }

  req.user = payload;

  return next();
};
