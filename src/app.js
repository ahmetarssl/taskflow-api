// Express uygulamasını oluşturduğumuz dosya. Middleware'leri burada sırayla ekliyoruz.
// Sıra önemli: express.json -> logger -> rotalar -> notFound -> errorHandler

const express = require('express');
const logger = require('./middleware/logger');
const routes = require('./routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// gelen JSON gövdesini req.body içine çevirir
app.use(express.json());
app.use(logger);

app.use('/', routes);

// hiçbir rotaya uymayan istek notFound'a düşer, hatalar da en sonda errorHandler'a gider
app.use(notFound);
app.use(errorHandler);

module.exports = app;
