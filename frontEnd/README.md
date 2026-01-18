# App Frontend - Vocabulary Learning App

React Native kelime öğrenme uygulaması.

## Kurulum

```bash
npm install
```

## Çalıştırma

```bash
# Expo ile başlat
npm start

# iOS için
npm run ios

# Android için
npm run android
```

## Proje Yapısı

```
appFrontEnd/
├── App.js                    # Ana uygulama + Navigation
├── src/
│   └── screens/
│       ├── LoginScreen.js    # Login ekranı
│       └── HomeScreen.js     # Ana sayfa dashboard
├── assets/                   # Görseller ve ikonlar
├── package.json
└── app.json                  # Expo konfigürasyonu
```

## Ekranlar

### 1. Login Screen
- Email/Username input
- Password input (göster/gizle toggle)
- Log In butonu → Home ekranına yönlendirir
- Sign Up linki

### 2. Home Screen (Dashboard)
- Kullanıcı selamlama header
- Bildirim butonu
- 4 ana özellik kartı:
  - **Okuma Modu** - Metinleri keşfet
  - **Kaynak Yükleme** - PDF veya Resim
  - **Kelime Çalış** - Flashcard & Eşle
  - **Listelerim** - Kaydedilenler
- Alt navigasyon (Ana Sayfa / Profil)

## Özellikler

- ✅ Modern ve temiz tasarım
- ✅ Poppins font ailesi
- ✅ React Navigation entegrasyonu
- ✅ iOS ve Android uyumlu
- ✅ Responsive tasarım
- ✅ Material Community Icons
