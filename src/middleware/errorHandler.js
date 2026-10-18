// Hata yakalayan middleware. Uygulamadaki bütün hatalar en sonunda buraya geliyor ve aynı JSON formatında dönüyor.
// Stack trace'i kullanıcıya göstermiyoruz, sadece konsola yazıyoruz.

const HTTP_BAD_REQUEST = 400;
const HTTP_INTERNAL_ERROR = 500;
const INTERNAL_ERROR_MESSAGE = 'Sunucuda beklenmeyen bir hata oluştu';

// hatanın türüne göre hangi kod ve mesajın döneceğine karar veriyor:
// - bizim fırlattığımız ApiError ise kendi kodu ve mesajı
// - express.json bozuk JSON'u parse edemediyse 400
// - geri kalan her şey 500, detayını kullanıcıya göstermiyoruz
const resolveError = (err) => {
  if (err.isApiError) {
    return { statusCode: err.statusCode, message: err.message };
  }
  if (err.type === 'entity.parse.failed') {
    return { statusCode: HTTP_BAD_REQUEST, message: 'İstek gövdesi geçerli bir JSON değil' };
  }
  return { statusCode: HTTP_INTERNAL_ERROR, message: INTERNAL_ERROR_MESSAGE };
};

// next kullanılmıyor ama Express'in bunu hata middleware'i olarak tanıması için 4 parametre şart
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const { statusCode, message } = resolveError(err);

  if (statusCode >= HTTP_INTERNAL_ERROR) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    error: { message, statusCode },
  });
};

module.exports = errorHandler;
