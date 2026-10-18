# TaskFlow API

Yazılım ekiplerinin görevlerini, projelerini ve çalışan sorumluluklarını takip etmesini sağlayan Node.js + Express.js tabanlı REST API.

## Gereksinimler

- **Node.js 18** veya üzeri (Node.js 24 ile test edilmiştir)
- npm

## Kurulum

```bash
git clone <depo-adresi>
cd taskflow-api
npm install
```

## Çalıştırma

```bash
npm start      # Sunucuyu node ile başlatır (canlı kullanım)
npm run dev    # Sunucuyu nodemon ile başlatır; kod değiştikçe otomatik yeniden başlar (geliştirme)
```

| Komut | Fark |
|---|---|
| `npm start` | `node src/server.js` çalıştırır. Kod değişiklikleri için sunucunun elle yeniden başlatılması gerekir. |
| `npm run dev` | `nodemon src/server.js` çalıştırır. Kaynak dosyalar kaydedildiğinde sunucu otomatik yeniden başlar. |

## Sunucu Adresi

Varsayılan olarak **http://localhost:3000** adresinde çalışır. Farklı bir port için `PORT` ortam değişkeni kullanılabilir:

```bash
PORT=4000 npm start
```

## Endpoint'ler

| Method | Yol | Açıklama | Başarı Kodu |
|---|---|---|---|
| GET | `/health` | Sunucu durumu | 200 |
| POST | `/api/tasks` | Yeni görev oluşturur | 201 |
| GET | `/api/tasks` | Tüm görevleri listeler | 200 |
| GET | `/api/tasks/:id` | Tek görev detayı | 200 |
| PUT | `/api/tasks/:id` | Görevi günceller (kısmi) | 200 |
| DELETE | `/api/tasks/:id` | Görevi siler | 200 |

**Geçerli değerler:**
- `status`: `pending`, `in-progress`, `completed` (varsayılan `pending`)
- `priority`: `low`, `medium`, `high` (varsayılan `medium`)

## Örnek İstek ve Yanıtlar

### GET /health

Yanıt `200`:

```json
{ "status": "ok", "uptime": 42 }
```

### POST /api/tasks

İstek gövdesi:

```json
{
  "title": "Raporlama servisi",
  "description": "Haftalık görev tamamlama raporunun PDF olarak üretilmesi",
  "priority": "high",
  "assignee": "Ayşe Çelik",
  "project": "TaskFlow Backend"
}
```

Yanıt `201`:

```json
{
  "success": true,
  "data": {
    "id": 7,
    "title": "Raporlama servisi",
    "description": "Haftalık görev tamamlama raporunun PDF olarak üretilmesi",
    "status": "pending",
    "priority": "high",
    "assignee": "Ayşe Çelik",
    "project": "TaskFlow Backend",
    "createdAt": "2026-10-17T12:30:45.123Z",
    "updatedAt": "2026-10-17T12:30:45.123Z"
  }
}
```

### GET /api/tasks

Yanıt `200`:

```json
{
  "success": true,
  "count": 6,
  "data": [
    {
      "id": 1,
      "title": "Kullanıcı kimlik doğrulama modülü",
      "description": "JWT tabanlı giriş akışının geliştirilmesi",
      "status": "in-progress",
      "priority": "high",
      "assignee": "Ahmet Arslan",
      "project": "TaskFlow Backend",
      "createdAt": "2026-10-10T09:00:00.000Z",
      "updatedAt": "2026-10-15T14:20:00.000Z"
    }
  ]
}
```

### GET /api/tasks/:id

`GET /api/tasks/1` — Yanıt `200`:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Kullanıcı kimlik doğrulama modülü",
    "description": "JWT tabanlı giriş akışının geliştirilmesi",
    "status": "in-progress",
    "priority": "high",
    "assignee": "Ahmet Arslan",
    "project": "TaskFlow Backend",
    "createdAt": "2026-10-10T09:00:00.000Z",
    "updatedAt": "2026-10-15T14:20:00.000Z"
  }
}
```

### PUT /api/tasks/:id

`PUT /api/tasks/1` — İstek gövdesi (yalnızca değişecek alanlar):

```json
{
  "status": "completed",
  "priority": "medium"
}
```

Yanıt `200`:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Kullanıcı kimlik doğrulama modülü",
    "description": "JWT tabanlı giriş akışının geliştirilmesi",
    "status": "completed",
    "priority": "medium",
    "assignee": "Ahmet Arslan",
    "project": "TaskFlow Backend",
    "createdAt": "2026-10-10T09:00:00.000Z",
    "updatedAt": "2026-10-17T12:35:10.456Z"
  }
}
```

### DELETE /api/tasks/:id

`DELETE /api/tasks/1` — Yanıt `200`:

```json
{
  "success": true,
  "data": { "message": "Görev silindi", "id": 1 }
}
```

## Hata Yanıtı Örnekleri

Tüm hatalar aynı formatta döner.

Olmayan görev — `GET /api/tasks/999` → `404`:

```json
{
  "success": false,
  "error": { "message": "Görev bulunamadı", "statusCode": 404 }
}
```

Başlıksız görev — `POST /api/tasks` (title yok) → `400`:

```json
{
  "success": false,
  "error": { "message": "\"title\" alanı zorunludur ve boş bırakılamaz", "statusCode": 400 }
}
```

Geçersiz durum değeri — `{ "title": "Test", "status": "done" }` → `400`:

```json
{
  "success": false,
  "error": {
    "message": "Geçersiz status değeri: \"done\". Geçerli değerler: pending, in-progress, completed",
    "statusCode": 400
  }
}
```

## Klasör Yapısı

```
taskflow-api/
├── src/
│   ├── server.js                 # Sunucuyu başlatır
│   ├── app.js                    # Express uygulaması ve middleware sırası
│   ├── routes/
│   │   ├── index.js              # /health ve /api/tasks bağlantısı
│   │   └── task.routes.js        # Görev yolları
│   ├── controllers/
│   │   └── task.controller.js    # HTTP istek/yanıt işlemleri
│   ├── services/
│   │   └── task.service.js       # İş mantığı ve doğrulama
│   ├── data/
│   │   ├── store.js              # JSON dosyası okuma/yazma
│   │   └── tasks.json            # Görev verileri
│   ├── middleware/
│   │   ├── logger.js             # İstek loglama
│   │   ├── notFound.js           # Tanımsız yollar için 404
│   │   └── errorHandler.js       # Merkezi hata işleyici
│   └── utils/
│       └── ApiError.js           # Durum kodlu özel hata sınıfı
├── docs/
│   ├── proje-tanitim-dokumani.md
│   └── postman/
│       ├── TaskFlow.postman_collection.json
│       └── screenshots/
├── logs/                         # requests.log burada oluşur
├── .gitignore
├── package.json
└── README.md
```

## Loglama

Her istek konsola ve **`logs/requests.log`** dosyasına şu formatta kaydedilir:

```
[2026-10-17T12:30:45.123Z] GET /api/tasks 200 - 12ms
```

Log dosyası ilk istekte otomatik oluşturulur ve `.gitignore` ile depoya eklenmez.

## Postman

`docs/postman/TaskFlow.postman_collection.json` dosyasını Postman'e içe aktararak tüm uçları test edebilirsiniz. Koleksiyon `baseUrl` değişkenini (`http://localhost:3000`) kullanır.
