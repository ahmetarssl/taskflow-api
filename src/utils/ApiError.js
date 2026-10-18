// Kendi hata sınıfımız. Error'dan türettim, ekstra olarak HTTP durum kodunu da taşıyor.

class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    // errorHandler bu sayede hatanın bizden mi geldiğini yoksa beklenmedik bir hata mı olduğunu anlıyor
    this.isApiError = true;
  }
}

module.exports = ApiError;
