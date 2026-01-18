# PDF Okuma Modu - Kullanım Kılavuzu

## 🎯 Özellikler

PDF okuma modu artık şu şekilde çalışıyor:

1. **PDF Yükleme**: Kullanıcı bir PDF dosyası seçer
2. **Otomatik Dönüştürme**: PDF Python servisine gönderilir ve plain text'e dönüştürülür
3. **Metin Olarak Kayıt**: Dönüştürülen metin veritabanına kaydedilir (PDF dosyası saklanmaz)
4. **Okuma Modu**: Kullanıcı metni düz metin olarak okur
5. **Kelime Seçimi**: Herhangi bir kelimeye dokunarak bilinmeyen kelimeler listesine ekleyebilir

## 🔧 Yapılan Değişiklikler

### 1. ApiService.js
- `PYTHON_SERVICE_URL` eklendi (Python servisi için)
- `pdfApi.extractTextFromPdf()` fonksiyonu eklendi
- PDF'i Python servisine gönderip plain text alıyor

### 2. UploadResourceScreen.js
- `savePdfFile()` fonksiyonu güncellendi
- PDF yüklendiğinde Python servisine gönderiliyor
- Gelen plain text `type: 'text'` olarak kaydediliyor
- Metadata'da orijinal PDF bilgileri saklanıyor:
  - `originalType: 'pdf'`
  - `originalFileName`
  - `pageCount`
  - `extractionMethod`

### 3. ReadingModeScreen.js
- Filtreleme mantığı güncellendi
- `pdf-origin` filtresi: PDF'den dönüştürülmüş metinler
- `text` filtresi: Direkt yapıştırılan metinler
- İkonlar metadata'ya göre gösteriliyor

### 4. ReaderScreen.js
- PDF render kodu tamamen kaldırıldı
- Artık her şey text olarak gösteriliyor
- Kelime seçimi tüm metinlerde çalışıyor
- Font boyutu ayarı tüm metinlerde mevcut

### 5. StorageService.js
- Değişiklik gerekmedi (zaten text olarak kaydediyor)

## 🚀 Kullanım

### Gereksinimler

1. **Python Servisi Çalışıyor Olmalı**:
   ```bash
   # Docker ile
   docker-compose up python-service
   
   # Veya direkt
   cd python-service
   python main.py
   ```

2. **IP Adresi Ayarı**:
   `frontEnd/src/services/ApiService.js` dosyasında:
   ```javascript
   const PYTHON_SERVICE_URL = 'http://192.168.1.100:8000'; // Kendi IP'nizi yazın
   ```

### Adımlar

1. **PDF Yükle**:
   - Ana sayfadan "Okuma Modu" → "Kaynak Yükle" → "PDF Yükle"
   - PDF dosyasını seç
   - Otomatik olarak metne dönüştürülecek

2. **Metni Oku**:
   - "Okuma Modu" ekranından PDF'i aç
   - Metin düz text olarak gösterilecek
   - Font boyutunu ayarlayabilirsin

3. **Kelime Ekle**:
   - Herhangi bir kelimeye dokun
   - Kelime listesi seç
   - Kelime otomatik olarak backend'e kaydedilecek

## 📊 Veri Akışı

```
PDF Dosyası
    ↓
[UploadResourceScreen]
    ↓
Python Service (/extract-pdf)
    ↓
Plain Text + Metadata
    ↓
[StorageService] → AsyncStorage
    ↓
[ReadingModeScreen] → Liste
    ↓
[ReaderScreen] → Okuma + Kelime Seçimi
    ↓
Backend API → Kelime Listesine Ekle
```

## 🐛 Hata Ayıklama

### Python Servisi Bağlantı Hatası
```
Error: PDF işlenirken bir hata oluştu. Python servisinin çalıştığından emin olun.
```

**Çözüm**:
1. Python servisinin çalıştığını kontrol et: `http://localhost:8000/health`
2. IP adresini doğru ayarladığından emin ol
3. Firewall'un 8000 portunu engellemediğini kontrol et

### PDF Metin Çıkarma Hatası
```
Error: PDF'den metin çıkarılamadı
```

**Çözüm**:
1. PDF dosyasının bozuk olmadığını kontrol et
2. PDF'in şifreli olmadığından emin ol
3. Python servis loglarını kontrol et

### Kelime Ekleme Hatası
```
Error: Kelime kaydedilemedi
```

**Çözüm**:
1. Backend servisinin çalıştığını kontrol et
2. JWT token'ın geçerli olduğunu kontrol et
3. Kelime listesinin var olduğunu kontrol et

## 📝 Notlar

- PDF dosyaları artık cihazda saklanmıyor (sadece plain text)
- Bu yaklaşım daha az depolama alanı kullanır
- Kelime seçimi daha hızlı ve güvenilir çalışır
- Tüm metinler aynı şekilde işlenir (PDF veya direkt metin fark etmez)

## 🔮 Gelecek İyileştirmeler

- [ ] PDF'den çıkarılan metnin sayfa numaralarını koruma
- [ ] Görsel içeren PDF'ler için görsel desteği
- [ ] Çevrimdışı PDF işleme (Python servisi olmadan)
- [ ] Batch PDF yükleme
- [ ] PDF'den çıkarılan metnin kalitesini artırma (OCR iyileştirmeleri)
