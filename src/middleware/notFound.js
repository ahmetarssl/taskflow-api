// Tanımlı olmayan bir yola istek gelirse 404 hatası oluşturup errorHandler'a gönderiyor.

const ApiError = require('../utils/ApiError');

const notFound = (req, res, next) => {
  next(new ApiError(404, `İstenen yol bulunamadı: ${req.method} ${req.originalUrl}`));
};

module.exports = notFound;
