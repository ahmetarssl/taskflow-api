# TaskFlow — Proje Tanıtım Dokümanı

**Görev ve Proje Yönetim Sistemi REST API**

## 1. Projenin Amacı

TaskFlow, bir yazılım ekibinin görevlerini, projelerini ve çalışanların sorumluluklarını tek bir merkezden takip edebilmesi için geliştirilmiş bir REST API'dir. Projenin amacı; görev oluşturma, çalışanlara atama, durum takibi ve önceliklendirme işlemlerini standart HTTP uçları üzerinden sunmak, bunu yaparken katmanlı mimari, merkezi hata yönetimi ve istek loglama gibi gerçek dünya backend uygulamalarında kullanılan yaklaşımları sade bir yapı içinde uygulamaktır.

## 2. Senaryo

Orta ölçekli bir yazılım şirketi, ekipler arasındaki işlerin e-posta ve mesajlaşma grupları üzerinden takip edilmesinden kaynaklanan sorunlar yaşamaktadır: hangi görevin kime atandığı, hangi aşamada olduğu ve ne kadar acil olduğu net değildir. Şirket, ileride web ve mobil istemcilerin bağlanabileceği, arayüzden bağımsız bir backend servisine ihtiyaç duymaktadır. TaskFlow bu ihtiyaca yanıt olarak her görevi başlık, açıklama, durum, öncelik, atanan kişi ve proje bilgisiyle kaydeder ve bu kayıtlar üzerinde tam CRUD işlemlerine izin verir.

## 3. Sistem Özellikleri

- Yeni görev oluşturma; `title` zorunlu, `status` ve `priority` için varsayılan değer atama
- Tüm görevleri toplam sayıyla birlikte listeleme
- Tek bir görevin detayını id ile görüntüleme
- Kısmi güncelleme (PUT): yalnızca gönderilen alanlar değişir, `updatedAt` otomatik yenilenir
- Görev silme
- `status` ve `priority` alanları için değer doğrulama; hatalı değerde geçerli seçenekler mesajda listelenir
- Otomatik artan `id` ve ISO 8601 (UTC) zaman damgaları
- Tüm uçlarda tutarlı JSON yanıt formatı (`success`, `data`, `error`)
- Merkezi hata yönetimi ve tanımsız yollar için 404 yanıtı
- Her isteği konsola ve `logs/requests.log` dosyasına kaydeden logger middleware
- Sunucu durumunu gösteren `GET /health` ucu

## 4. Teknoloji Yığını

| Bileşen | Açıklama |
|---|---|
| **Node.js** | JavaScript çalışma ortamı, CommonJS modül sistemi |
| **Express.js** (`^4.19.2`) | HTTP sunucusu, yönlendirme ve middleware altyapısı |
| **JSON tabanlı veri katmanı** | Veriler `src/data/tasks.json` dosyasında tutulur, Node.js `fs` modülü ile okunur/yazılır |
| **nodemon** | Geliştirme sırasında dosya değişikliklerinde sunucuyu otomatik yeniden başlatır |

Harici veritabanı veya ek kütüphane kullanılmamıştır.

## 5. Mimari Yapı

Proje **katmanlı mimari** ile tasarlanmıştır. Her katmanın tek bir sorumluluğu vardır ve bir katman yalnızca bir alt katmanla konuşur:

```
İstek → routes → controllers → services → data/store → tasks.json
```

```
src/
├── server.js            # Sunucuyu belirtilen portta başlatır
├── app.js               # Express uygulaması ve middleware sırası
├── routes/              # Yol tanımları
├── controllers/         # HTTP katmanı
├── services/            # İş mantığı
├── data/                # Veri erişimi ve JSON dosyası
├── middleware/          # logger, notFound, errorHandler
└── utils/               # ApiError sınıfı
```

| Katman | Sorumluluk |
|---|---|
| **routes** | Yalnızca HTTP metodu + yol tanımı yapar ve isteği ilgili controller fonksiyonuna yönlendirir. |
| **controllers** | İstekten parametre ve gövdeyi alır, servisi çağırır, sonucu uygun durum koduyla JSON olarak döner. İş mantığı içermez. |
| **services** | Doğrulama, varsayılan değer atama, id üretimi, zaman damgası ve CRUD kuralları gibi tüm iş mantığını içerir. |
| **data/store.js** | `tasks.json` dosyasını okuma ve yazma işinden sorumludur. Yazma işlemi geçici dosya + yeniden adlandırma ile güvenli yapılır. |
| **middleware** | İstek loglama, tanımsız yol yakalama ve merkezi hata işleme. |
| **utils** | `ApiError`: HTTP durum kodu taşıyan özel hata sınıfı. |

Middleware sırası: `express.json()` → `logger` → rotalar → `notFound` → `errorHandler`

## 6. Veri Modeli

| Alan | Tip | Açıklama |
|---|---|---|
| `id` | number | Otomatik artan benzersiz kimlik (mevcut en yüksek id + 1) |
| `title` | string | Görev başlığı — **zorunlu** |
| `description` | string | Görevin ayrıntılı açıklaması |
| `status` | string | `pending`, `in-progress`, `completed` (varsayılan: `pending`) |
| `priority` | string | `low`, `medium`, `high` (varsayılan: `medium`) |
| `assignee` | string | Görevin atandığı çalışan |
| `project` | string | Görevin ait olduğu proje |
| `createdAt` | string | Oluşturulma zamanı, ISO 8601 UTC |
| `updatedAt` | string | Son güncellenme zamanı, ISO 8601 UTC |

## 7. API Uçları

| Method | Yol | Açıklama | Durum Kodu |
|---|---|---|---|
| GET | `/health` | Sunucu durumu ve çalışma süresi | 200 |
| POST | `/api/tasks` | Yeni görev oluşturur | 201 (hata: 400) |
| GET | `/api/tasks` | Tüm görevleri listeler | 200 |
| GET | `/api/tasks/:id` | Tek görev detayı | 200 (hata: 404) |
| PUT | `/api/tasks/:id` | Görevi kısmi olarak günceller | 200 (hata: 400, 404) |
| DELETE | `/api/tasks/:id` | Görevi siler | 200 (hata: 404) |

## 8. Middleware Yapısı

**Logger (`src/middleware/logger.js`)** her istek için şu bilgileri kaydeder:

- HTTP metodu (GET, POST, PUT, DELETE)
- İstek yolu (endpoint)
- ISO 8601 formatında zaman damgası
- Yanıt durum kodu
- İsteğin sürdüğü süre (milisaniye)

Örnek kayıt: `[2026-10-17T12:30:45.123Z] GET /api/tasks 200 - 12ms`

Durum kodu ve süre, yanıt istemciye gönderildiği anda tetiklenen `res.on('finish', ...)` olayı ile yakalanır; böylece hata durumunda bile gerçek sonuç kaydedilir. Kayıtlar hem konsola yazılır hem de ekleme modunda açılmış bir akış (stream) ile `logs/requests.log` dosyasına eklenir. Yazma asenkron olduğundan isteği bloklamaz.

**Neden gerekli?** İstek logları; hataların hangi uçta ve ne zaman oluştuğunu tespit etmeyi, yavaş çalışan uçları süre bilgisiyle belirlemeyi, API kullanımını izlemeyi ve gerektiğinde geriye dönük denetim yapmayı sağlar. Canlı ortamda sorun giderme sürecinin en temel bilgi kaynağıdır.

Diğer middleware'ler:

- **notFound** — Hiçbir rotayla eşleşmeyen istekler için 404 `ApiError` üretir.
- **errorHandler** — Dört parametreli Express hata middleware'idir. Tüm hataları yakalar, tutarlı JSON hata formatında döner; beklenmeyen hatalarda stack trace'i yalnızca konsola yazar, istemciye göndermez.
