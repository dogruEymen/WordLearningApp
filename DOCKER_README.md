# 🐳 Word Learning App - Docker Kurulum Kılavuzu

Bu kılavuz, Word Learning App backend servislerini Docker ile nasıl çalıştıracağınızı açıklar.

## 📋 Gereksinimler

- Docker Desktop (veya Docker Engine + Docker Compose)
- En az 8GB RAM (Ollama için)
- En az 20GB boş disk alanı

## 🚀 Hızlı Başlangıç

### 1. İlk Kurulum

```bash
# Proje dizinine git
cd word-learning-app-backend

# Tüm servisleri derle ve başlat
make setup
```

Bu komut:
- Docker image'larını derler
- Tüm container'ları başlatır
- Ollama'ya llama3.1:8b modelini indirir (3-5 dakika sürebilir)

### 2. Manuel Kurulum

Eğer `make` komutu yoksa:

```bash
# Image'ları derle
docker compose build

# Servisleri başlat
docker compose up -d

# Logları izle (opsiyonel)
docker compose logs -f

# Ollama modeli indir (servisler başladıktan 30 saniye sonra)
docker compose exec ollama ollama pull llama3.1:8b
```

## 🔧 Servisler

| Servis | Port | Açıklama |
|--------|------|----------|
| Backend API | 8080 | Spring Boot REST API |
| Python Service | 8000 | Vektör embedding & cross-encoding |
| PostgreSQL | 5432 | Veritabanı (pgvector ile) |
| Ollama | 11434 | LLM servisi |

## 📡 API Endpoints

### Health Check
```bash
# Backend
curl http://localhost:8080/auth/health

# Python Service
curl http://localhost:8000/health
```

### Auth
```bash
# Kayıt
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456","name":"Test User"}'

# Giriş
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'
```

## 🛠️ Yönetim Komutları

```bash
# Servislerin durumunu göster
make status

# Logları izle
make logs

# Belirli bir servisin loglarını izle
make logs-backend
make logs-python
make logs-ollama
make logs-db

# Servisleri yeniden başlat
make restart

# Servisleri durdur
make down

# Her şeyi temizle (dikkatli kullan!)
make clean
```

## 🔍 Sorun Giderme

### 1. Backend başlamıyor

```bash
# Logları kontrol et
docker compose logs backend

# PostgreSQL'in hazır olduğundan emin ol
docker compose logs postgres
```

### 2. Python servisi uzun süre başlamıyor

İlk başlangıçta ML modellerini indirmesi gerekiyor. Bu 2-3 dakika sürebilir.

```bash
# Progress'i izle
docker compose logs -f python-service
```

### 3. Ollama model indiremiyorum

```bash
# Ollama'nın çalıştığından emin ol
docker compose ps ollama

# Manuel olarak model indir
docker compose exec ollama ollama pull llama3.1:8b
```

### 4. Bellek yetersiz

Ollama çok bellek kullanır. Minimum 8GB RAM önerilir.

```bash
# Kaynak kullanımını kontrol et
docker stats
```

### 5. Port çakışması

Eğer portlar kullanılıyorsa `.env` dosyasında değiştirin:

```env
DB_PORT=5433  # Farklı PostgreSQL portu
```

## 📁 Dosya Yapısı

```
word-learning-app-backend/
├── docker-compose.yml      # Ana orchestration dosyası
├── .env                    # Environment variables
├── Makefile                # Yönetim komutları
├── backEnd/
│   ├── Dockerfile          # Backend image
│   └── src/...
├── python-service/
│   ├── Dockerfile          # Python image
│   ├── main.py
│   └── requirements.txt
└── docker/
    └── init-db.sql         # PostgreSQL init script
```

## 🔐 Güvenlik

Production için `.env` dosyasındaki değerleri değiştirin:

```env
DB_PASSWORD=güçlü_şifre_buraya
JWT_SECRET=en_az_32_karakterlik_rastgele_string
```

## 📱 Frontend Bağlantısı

React Native uygulamasında `ApiService.js` dosyasında:

```javascript
// Docker host IP'si (gerçek cihazda)
const API_BASE_URL = 'http://YOUR_COMPUTER_IP:8080';

// Android Emülatörde
const API_BASE_URL = 'http://10.0.2.2:8080';
```

## 🔄 Güncelleme

Kod değişikliklerinden sonra:

```bash
# Sadece backend'i yeniden derle
docker compose build backend
docker compose up -d backend

# Veya tüm servisleri yeniden derle
make build
make restart
```

## 📊 Monitoring

```bash
# CPU/Memory kullanımı
docker stats

# Disk kullanımı
docker system df

# Tüm container'ların durumu
docker compose ps -a
```

## 🧹 Temizlik

```bash
# Durmuş container'ları temizle
docker container prune

# Kullanılmayan image'ları temizle
docker image prune

# Her şeyi temizle (DİKKAT: Veriler silinir!)
make clean
```
