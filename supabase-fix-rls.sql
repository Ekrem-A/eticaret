-- ================================================================
-- RLS POLİCİLERİ KONTROL VE FİKSLE
-- ================================================================

-- 1. Kategoriler için RLS'i devre dışı bırak veya public policy oluştur
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;

-- 2. Ürünler için RLS'i devre dışı bırak veya public policy oluştur
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- 3. Diğer tablolar için RLS'i koru ama read policies'ı public yap

-- Sepet ürünleri: Okuma auth'd users'a, yazma kendi sepet'lere
ALTER TABLE cart_items DISABLE ROW LEVEL SECURITY;

-- Siparişler: Kendi siparişlerini görebilirler
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- Reviewlar: Herkes okuyabilir, auth'd users yazabilir
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;

-- ================================================================
-- Test Query'leri
-- ================================================================

-- Kategorileri kontrol et
SELECT COUNT(*) as category_count FROM categories;

-- Ürünleri kontrol et
SELECT COUNT(*) as product_count FROM products WHERE is_active = true;

-- İlk 5 ürünü listele
SELECT id, name, price, stock, is_active FROM products LIMIT 5;
