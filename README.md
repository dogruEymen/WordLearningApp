# Word Learning App - Kelime Öğrenme Uygulaması

Modern bir kelime öğrenme platformu - PDF okuma, kelime listesi yönetimi ve quiz sistemi ile.

## 🚀 Özellikler

### 📚 PDF Okuma Modu
- PDF dosyalarını yükleyin ve otomatik olarak plain text'e dönüştürün
- Python servisi ile PyMuPDF kullanarak metin çıkarma
- OCR desteği (taranmış belgeler için)
- Metni okurken kelime seçimi
- Seçilen kelimeleri bilinmeyen kelimeler listesine ekleme

### 📝 Kelime Listesi Yönetimi
- Özel kelime listeleri oluşturma
- Kelimeleri bağlamıyla birlikte kaydetme
- Kelime anlamları ve örnek cümleler
- Backend API ile senkronizasyon

### 🎯 Quiz Sistemi
- Çoktan seçmeli sorular
- Boşluk doldurma soruları
- Eşleştirme soruları
- Otomatik soru üretimi

### 🔐 Kullanıcı Yönetimi
- JWT tabanlı kimlik doğrulama
- Kullanıcı profili
- Güvenli oturum yönetimi

## 🏗️ Mimari

```
┌─────────────────┐
│   React Native  │  (Frontend - Expo)
│    Frontend     │
└────────┬────────┘
         │
         ├──────────────────┐
         │                  │
┌────────▼────────┐  ┌──────▼──────────┐
│  Spring Boot    │  │  Python Service │
│    Backend      │  │  (PDF Extract)  │
└────────┬────────┘  └─────────────────┘
         │
┌────────▼────────┐
│   PostgreSQL    │
│   + pgvector    │
└─────────────────┘
```

### Teknolojiler

**Frontend:**
- React Native (Expo)
- AsyncStorage (local storage)
- React Navigation
- Expo Document Picker

**Backend:**
- Spring Boot 3.x
- PostgreSQL + pgvector
- JWT Authentication
- Ollama (LLM)

**Python Service:**
- FastAPI
- PyMuPDF (PDF text extraction)
- Sentence Transformers (embeddings)
- Tesseract OCR (optional)

## 🛠️ Kurulum

### Gereksinimler

- Docker & Docker Compose
- Node.js 18+ (frontend için)
- Java 17+ (backend için)
- Python 3.10+ (Python servisi için)

### Hızlı Başlangıç

1. **Repoyu klonlayın:**
```bash
git clone https://github.com/dogruEymen/WordLearningApp.git
cd WordLearningApp
```

2. **Environment dosyasını oluşturun:**
```bash
cp .env.example .env
# .env dosyasını düzenleyin
```

3. **Docker ile tüm servisleri başlatın:**
```bash
docker-compose up -d
```

4. **Frontend'i başlatın:**
```bash
cd frontEnd
npm install
npm start
```

### Manuel Kurulum

Detaylı kurulum talimatları için:
- Backend: [backEnd/README.md](backEnd/README.md)
- Frontend: [frontEnd/README.md](frontEnd/README.md)
- Python Service: [python-service/README.md](python-service/README.md)
- Docker: [DOCKER_README.md](DOCKER_README.md)

## 📖 Kullanım

### PDF Okuma Modu

1. **PDF Yükle:**
   - Ana sayfa → "Okuma Modu" → "Kaynak Yükle" → "PDF Yükle"
   - PDF dosyasını seç
   - Otomatik olarak metne dönüştürülecek

2. **Metni Oku:**
   - "Okuma Modu" ekranından PDF'i aç
   - Metin düz text olarak gösterilecek
   - Font boyutunu ayarlayabilirsin

3. **Kelime Ekle:**
   - Herhangi bir kelimeye dokun
   - Kelime listesi seç
   - Kelime otomatik olarak backend'e kaydedilecek

Detaylı bilgi: [PDF_OKUMA_MODU_README.md](PDF_OKUMA_MODU_README.md)

## 🔧 Yapılandırma

### Backend API URL

`frontEnd/src/services/ApiService.js` dosyasında:
```javascript
const API_BASE_URL = 'http://192.168.1.100:8080'; // Kendi IP'nizi yazın
const PYTHON_SERVICE_URL = 'http://192.168.1.100:8000';
```

### Docker Servisleri

- **Backend**: http://localhost:8080
- **Python Service**: http://localhost:8000
- **PostgreSQL**: localhost:5432
- **Ollama**: http://localhost:11434

## 📚 API Dokümantasyonu

### Backend Endpoints

- `POST /auth/login` - Kullanıcı girişi
- `POST /auth/register` - Kullanıcı kaydı
- `GET /wordlist/get-mine` - Kelime listelerini getir
- `POST /wordlist/create` - Yeni liste oluştur
- `POST /wordlist/{id}/add-word` - Listeye kelime ekle
- `GET /quiz/generate-quiz` - Quiz oluştur

### Python Service Endpoints

- `POST /extract-pdf` - PDF'den metin çıkar
- `POST /vectorize` - Metni vektöre dönüştür
- `POST /cross-encode` - Semantik benzerlik hesapla

## 🧪 Test

```bash
# Backend testleri
cd backEnd
./gradlew test

# Frontend testleri
cd frontEnd
npm test
```

## 📦 Deployment

### Docker ile Production

```bash
# Production build
docker-compose -f docker-compose.prod.yml up -d

# Logları kontrol et
docker-compose logs -f
```

### Manuel Deployment

1. Backend JAR oluştur: `./gradlew bootJar`
2. Frontend build: `npm run build`
3. Python servisi: `uvicorn main:app --host 0.0.0.0 --port 8000`

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📝 Değişiklik Geçmişi

### v2.0.0 (2026-01-18)
- ✨ PDF okuma modu - Python servisi entegrasyonu
- ✨ Otomatik PDF to text dönüşümü
- ✨ Metadata bazlı filtreleme
- 🔧 PDF render karmaşıklığı kaldırıldı
- 📚 Yeni dokümantasyon eklendi

### v1.0.0
- 🎉 İlk sürüm
- ✨ Kelime listesi yönetimi
- ✨ Quiz sistemi
- ✨ JWT authentication

Detaylı değişiklikler: [DEGISIKLIK_OZETI.md](DEGISIKLIK_OZETI.md)

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 👥 Ekip

- **Backend & Python Service**: [Eymen Doğru](https://github.com/dogruEymen)
- **Frontend**: [Eymen Doğru](https://github.com/dogruEymen)

## 📞 İletişim

- GitHub: [@dogruEymen](https://github.com/dogruEymen)
- Repo: [WordLearningApp](https://github.com/dogruEymen/WordLearningApp)

## 🙏 Teşekkürler

- [PyMuPDF](https://pymupdf.readthedocs.io/) - PDF text extraction
- [Sentence Transformers](https://www.sbert.net/) - Text embeddings
- [Ollama](https://ollama.ai/) - Local LLM
- [Expo](https://expo.dev/) - React Native framework

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!
