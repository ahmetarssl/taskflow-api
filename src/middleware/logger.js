// Logger middleware. Her istekte metodu, yolu, zamanı, durum kodunu ve sürenin kaç ms olduğunu kaydediyor.
// Kayıtlar hem konsola yazılıyor hem de logs/requests.log dosyasına ekleniyor.

const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '..', '..', 'logs');
const LOG_FILE_PATH = path.join(LOG_DIR, 'requests.log');

// logs klasörü yoksa uygulama açılırken oluşturuyoruz
fs.mkdirSync(LOG_DIR, { recursive: true });

// dosyayı 'a' (append) modunda bir kere açıp açık tutuyorum, her istekte tekrar açmaya gerek kalmıyor.
// stream asenkron yazdığı için isteği bekletmiyor
const logStream = fs.createWriteStream(LOG_FILE_PATH, { flags: 'a' });

logStream.on('error', (error) => {
  console.error('Log dosyasına yazılamadı:', error.message);
});

// örnek çıktı: [2026-10-17T12:30:45.123Z] GET /api/tasks 200 - 12ms
const formatLogLine = ({ timestamp, method, url, statusCode, durationMs }) =>
  `[${timestamp}] ${method} ${url} ${statusCode} - ${durationMs}ms`;

const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const startTime = process.hrtime.bigint();

  // durum kodu ve süre ancak yanıt gönderildikten sonra belli oluyor,
  // o yüzden 'finish' olayını bekleyip öyle logluyoruz
  res.on('finish', () => {
    // hrtime nanosaniye veriyor, 1e6'ya bölüp ms'ye çeviriyoruz
    const durationMs = Math.round(Number(process.hrtime.bigint() - startTime) / 1e6);
    const line = formatLogLine({
      timestamp,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      durationMs,
    });

    console.log(line);
    logStream.write(`${line}\n`);
  });

  next();
};

module.exports = logger;
