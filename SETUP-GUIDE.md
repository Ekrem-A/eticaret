# AŞAMA 1: TEMEL KURULUM - SETUP REHBERI

## ✅ Tamamlananlar

1. ✅ Next.js 14 projesi kurulu
2. ✅ Supabase paketleri yüklendi (@supabase/supabase-js, auth-helpers vb.)
3. ✅ Klasör yapısı oluşturuldu
4. ✅ Supabase client konfigürasyonu (`lib/supabase.ts`)
5. ✅ .env.local dosyası oluşturuldu (placeholder'larla)
6. ✅ Database types oluşturuldu (`types/database.ts`)
7. ✅ SQL setup script oluşturuldu (`supabase-setup.sql`)

---

## 📋 SONRAKI ADIMLAR

### 1️⃣ Supabase Projesi Oluştur
1. https://supabase.com adresine git
2. "New Project" butonuna tıkla
3. Proje adı: `eticaret`
4. Database Password: **Güçlü bir şifre belirle ve KAY DET!**
5. Region: **Turkey (tr-ist)** seç
6. Projeyi oluştur (2-3 dakika sürebilir)

### 2️⃣ API Credentials'ı Kopyala
1. Supabase Dashboard'da sol menüden **Settings > API** git
2. Şu değerleri kopyala:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

### 3️⃣ .env.local Dosyasını Güncelle
Proje kökünde `.env.local` dosyasını aç ve credentials'ları yapıştır:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5...
```

### 4️⃣ Veritabanı Tablolarını Oluştur
1. Supabase Dashboard'da **SQL Editor** aç
2. Sol üstte "+" butonuna tıkla → "New Query"
3. [supabase-setup.sql](./supabase-setup.sql) dosyasının içeriğini KOPYAla
4. SQL Editor'a YAPIŞT
5. **Run** butonuna tıkla

Eğer başarılıysa şu mesaj görmelisin:
```
Executed successfully in 2.5 seconds
```

### 5️⃣ Storage Bucket'larını Oluştur
1. Sol menüden **Storage** aç
2. "New bucket" butonuna tıkla
3. Şu bucket'ları oluştur:

| Bucket | Visibility | Tur |
|--------|-----------|-----|
| `products` | Public | Ürün görselleri |
| `avatars` | Public | Profil fotoları |
| `invoices` | Private | Faturalar |

### 6️⃣ Geliştirme Sunucusunu Başlat
```bash
npm run dev
```

Sonra açılan terminal'de:
```
✓ Ready in 3.2s
✓ Ready on http://localhost:3000
```

Tarayıcında http://localhost:3000 aç ve Next.js welcome page'ini görmeli.

---

## 🧪 Verification Tests

### Test 1: Supabase Bağlantısını Kontrol Et
```bash
npm run dev
```
Sunucu hatasız başlamalı.

### Test 2: Environment Variables
`.env.local` dosyasında şu satırlar olmalı:
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### Test 3: Database Tablolarını Kontrol Et
Supabase Dashboard > Table Editor'da şu tablolar görülmelidir:
- [ ] categories
- [ ] products
- [ ] orders
- [ ] order_items
- [ ] cart_items
- [ ] reviews
- [ ] coupons

---

## ⚠️ Yaygın Hatalar

### Hata: "Missing Supabase environment variables"
→ `.env.local` dosyasını kontrol et, tüm key'ler dolu mu?

### Hata: "Failed to authenticate"
→ Supabase anon key doğru mu? Supabase > Settings > API'de kontrol et

### Hata: "Table does not exist"
→ SQL setup script'i çalıştırdın mı? Supabase > SQL Editor'da kontrol et

### Hata: "CORS error"
→ Supabase Dashboard > API > CORS Settings'de http://localhost:3000 ekle

---

## 📁 Proje Yapısı Özeti

```
eticaret/
├── .env.local                    # ← DOLDUR!
├── supabase-setup.sql           # ← Supabase'de çalıştır
├── lib/
│   └── supabase.ts              # Supabase client config
├── types/
│   └── database.ts              # TypeScript types
├── components/                  # React components
├── app/                         # Next.js pages/routes
│   ├── (client)/               # Müşteri alanı
│   ├── (auth)/                 # Auth sayfaları
│   ├── admin/                  # Admin paneli
│   └── api/                    # API routes
└── package.json
```

---

## 🚀 Sonraki Aşama

AŞAMA 1 tamamlandıktan sonra: **AŞAMA 2: Kimlik Doğrulama**
- Login/Register sayfaları
- Protected routes
- useAuth hook
- Session yönetimi

---

💡 **Sorularınız varsa**, lütfen sorgulamaktan çekinmeyin!
