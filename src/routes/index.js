// Ana router dosyası. /health ucunu burada tanımladım, görev rotalarını da /api/tasks altına bağladım.

const express = require('express');
const taskRoutes = require('./task.routes');

const router = express.Router();

// sunucu çalışıyor mu diye kontrol etmek için, uptime saniye cinsinden
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: Math.floor(process.uptime()) });
});

router.use('/api/tasks', taskRoutes);

module.exports = router;
