# 🎓 EduSync - Okul Yönetim Platformu

Özel okullar için abonelik tabanlı SaaS okul yönetim platformu.

---

## 🚀 HIZLI KURULUM (5 Adım)

### Ön Gereksinimler
- **Node.js** v20+ → [nodejs.org](https://nodejs.org) veya `nvm install 20`
- **Docker Desktop** v4+ → [docker.com](https://docker.com/products/docker-desktop)
- **Git** v2.30+

---

### 1️⃣ Projeyi Hazırlayın
```bash
cd edusync
cp .env.example .env
```

### 2️⃣ Docker Servislerini Başlatın
```bash
docker compose up -d
```
PostgreSQL (5432), Redis (6379), MinIO (9000/9001) çalışmaya başlar.

Kontrol:
```bash
docker compose ps
# 3 servis "running" olmalı
```

### 3️⃣ Bağımlılıkları Yükleyin
```bash
npm install
```

### 4️⃣ Veritabanını Hazırlayın
```bash
# Migration dosyalarını oluştur
npm run db:generate

# Tabloları oluştur
npm run db:migrate

# Demo verilerini yükle
npm run db:seed
```

### 5️⃣ API'yi Başlatın
```bash
npm run dev:api
```

API `http://localhost:4000` adresinde çalışmaya başlar.

---

## 📡 API ENDPOINTLERİ

Base URL: `http://localhost:4000/api/v1`

### Health Check
```
GET /health
```

### Auth
```
POST /api/v1/auth/login        # Giriş yap
POST /api/v1/auth/register     # Kayıt ol
POST /api/v1/auth/refresh      # Token yenile
POST /api/v1/auth/logout       # Çıkış yap (auth gerekli)
GET  /api/v1/auth/me           # Mevcut kullanıcı bilgisi (auth gerekli)
```

### Students (Auth gerekli)
```
GET    /api/v1/students          # Öğrenci listesi (filtre + pagination)
GET    /api/v1/students/:id      # Öğrenci detayı
POST   /api/v1/students          # Yeni öğrenci ekle
PUT    /api/v1/students/:id      # Öğrenci güncelle
DELETE /api/v1/students/:id      # Öğrenci sil (soft delete)
```

### Schools (Auth gerekli)
```
GET /api/v1/schools              # Okul listesi (Super Admin)
GET /api/v1/schools/:id          # Okul detayı
```

---

## 🧪 API TEST ÖRNEKLERİ

### Login
```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@edusync.com",
    "password": "SuperAdmin123!"
  }'
```

### Token ile İstek
```bash
# Login'den dönen accessToken'ı kullanın
TOKEN="eyJhbG..."

curl http://localhost:4000/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### Öğrenci Listesi
```bash
curl "http://localhost:4000/api/v1/students?page=1&pageSize=10" \
  -H "Authorization: Bearer $TOKEN"
```

### Yeni Öğrenci Ekleme
```bash
curl -X POST http://localhost:4000/api/v1/students \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "firstName": "Zeynep",
    "lastName": "Yıldız",
    "dateOfBirth": "2016-03-20",
    "gender": "FEMALE",
    "bloodType": "B+"
  }'
```

---

## 🔑 DEMO GİRİŞ BİLGİLERİ

| Rol | E-posta | Şifre |
|-----|---------|-------|
| Super Admin | admin@edusync.com | SuperAdmin123! |
| Müdür | mudur@demo-okulu.com | Demo1234! |
| Öğretmen | ogretmen@demo-okulu.com | Demo1234! |
| Veli | veli@demo-okulu.com | Demo1234! |

---

## 🗂️ PROJE YAPISI

```
edusync/
├── apps/
│   ├── api/                     # ✅ Backend API (Fastify)
│   │   └── src/
│   │       ├── config/env.ts    # Env validation (Zod)
│   │       ├── middleware/
│   │       │   ├── auth.ts      # JWT + RBAC + Tenant Guard
│   │       │   └── validate.ts  # Zod validation
│   │       ├── modules/
│   │       │   ├── auth/        # Login, register, refresh, logout
│   │       │   ├── students/    # CRUD + pagination + filter
│   │       │   └── schools/     # Tenant management
│   │       ├── utils/
│   │       │   ├── jwt.ts       # jose JWT operations
│   │       │   ├── password.ts  # Argon2id hashing
│   │       │   ├── errors.ts    # Custom error classes
│   │       │   └── response.ts  # Standardized API responses
│   │       └── server.ts        # Fastify entry point
│   ├── mobile/                  # 🔜 React Native (Expo)
│   ├── school-admin/            # 🔜 React Web Panel
│   └── super-admin/             # 🔜 React Web Panel
├── packages/
│   ├── shared/                  # ✅ Enums, constants, types
│   ├── validators/              # ✅ Zod schemas
│   └── db/                      # ✅ Drizzle ORM schemas
├── docker-compose.yml           # ✅ PG + Redis + MinIO
├── .env.example                 # ✅ Env template
└── package.json                 # ✅ Monorepo workspace
```

---

## 📋 FAZ PLANI

| Faz | İçerik | Durum |
|-----|--------|-------|
| **Faz 1** | Altyapı + Auth + Student CRUD + API | ✅ Tamamlandı |
| **Faz 1.5** | Yoklama, Mesaj, Duyuru, Yemek, Ders Programı | 🔜 Sırada |
| **Faz 2** | School Admin + Super Admin Web Panelleri | 🔜 |
| **Faz 3** | React Native Mobil Uygulama | 🔜 |
| **Faz 4** | Mali Yönetim + Servis Takip | 🔜 |
| **Faz 5** | AI + Portfolio + İleri Özellikler | 🔜 |

---

## ⚙️ KULLANILAN TEKNOLOJİLER

| Katman | Teknoloji |
|--------|-----------|
| Runtime | Node.js 22 LTS + TypeScript 5.5 |
| API Framework | Fastify 5 |
| ORM | Drizzle ORM |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Auth | JWT (jose) + Argon2id |
| Validation | Zod |
| Storage | MinIO (S3 compatible) |
| Monorepo | npm workspaces |
| Container | Docker Compose |

---

## 🛡️ GÜVENLİK ÖZELLİKLERİ

- JWT Access Token (15dk) + Refresh Token Rotation (30 gün)
- Argon2id password hashing
- Rate limiting (IP + user bazlı)
- Brute force protection (hesap kilitleme)
- RBAC (6 rol, granüler izinler)
- Tenant isolation (RLS hazırlığı)
- CORS + Helmet + CSP headers
- Zod input validation (tüm endpoint'lerde)
- Audit logging (tüm kritik işlemler)
- Soft delete (veri kaybı önleme)

---

## 🐛 SORUN GİDERME

### Docker servisleri başlamıyor
```bash
# Logları kontrol edin
docker compose logs postgres
docker compose logs redis

# Port çakışması varsa servisleri durdurun
docker compose down
docker compose up -d
```

### Migration hatası
```bash
# Veritabanını sıfırlayın
docker compose down -v  # volumes'ları siler
docker compose up -d
npm run db:generate
npm run db:migrate
npm run db:seed
```

### Port 4000 kullanılıyor
```bash
# .env dosyasında PORT değerini değiştirin
PORT=4001
```

### npm install hatası
```bash
# Cache temizleyip tekrar deneyin
npm cache clean --force
rm -rf node_modules
npm install
```
