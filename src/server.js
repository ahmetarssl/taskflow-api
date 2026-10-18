// Projenin başlangıç dosyası. app.js'te hazırladığımız uygulamayı burada porta bağlayıp çalıştırıyoruz.
// Port .env'de yoksa 3000 kullanılıyor.

const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`TaskFlow API http://localhost:${PORT} adresinde çalışıyor`);
});
