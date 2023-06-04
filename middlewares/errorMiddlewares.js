module.exports = (err, req, res, next) => {
  const { statusCode = err.statusCode || 500, message } = err;
  res.status(err.statusCode).send({
    message: statusCode === 500 ? 'Server error' : message,
  });
  return next();
};
