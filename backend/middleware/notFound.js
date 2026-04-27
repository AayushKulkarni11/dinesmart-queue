function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Not found: ${req.originalUrl}`));
}

module.exports = { notFound };

