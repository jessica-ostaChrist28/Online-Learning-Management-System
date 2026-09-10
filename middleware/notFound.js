const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    errorCode: 'ROUTE_NOT_FOUND'
  });
};

module.exports = { notFound };
