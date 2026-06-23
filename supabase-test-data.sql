-- ================================================================
-- SUPABASE E-TICARET - TEST VERİSİ
-- Bu scriptini Supabase Dashboard > SQL Editor'da çalıştır
-- ================================================================

-- 1. KATEGORİ VERİLERİ
INSERT INTO categories (name, slug, description, image_url) VALUES
  ('Elektronik', 'elektronik', 'Tüm elektronik ürünleri ve cihazlar', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop'),
  ('Giyim & Moda', 'giyim-moda', 'Erkek ve kadın giyim, ayakkabı ve aksesuarları', 'https://images.unsplash.com/photo-1490481651985-2ad143146828?w=400&h=300&fit=crop'),
  ('Kitap', 'kitap', 'Tüm türde kitaplar, ders kitapları ve romanlar', 'https://images.unsplash.com/photo-1507842217343-583f20270319?w=400&h=300&fit=crop'),
  ('Spor & Outdoor', 'spor-outdoor', 'Spor malzemeleri ve outdoor ekipmanları', 'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=400&h=300&fit=crop'),
  ('Ev & Yaşam', 'ev-yasam', 'Mobilya, dekorasyon ve ev eşyaları', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop')
ON CONFLICT DO NOTHING;

-- 2. ELEKTRONİK ÜRÜNLER
INSERT INTO products (name, slug, description, price, stock, category_id, sku, image_url, rating, reviews_count, featured, is_active) VALUES
  (
    'Wireless Bluetooth Kulaklık',
    'wireless-bluetooth-kulaklik',
    'Gürültü önleme teknolojili, 30 saatlik pil ömrü, ergonomik tasarım ve Premium ses kalitesi',
    849.99,
    45,
    (SELECT id FROM categories WHERE slug = 'elektronik'),
    'TECH-001',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
    4.5,
    128,
    true,
    true
  ),
  (
    '4K Ultra HD Aksiyon Kamerası',
    '4k-ultra-hd-aksiyon-kamerasi',
    '4K video kaydı, 60fps, su geçirmez tasarım, geniş açılı lens, aksiyon sporları için ideal',
    1299.99,
    23,
    (SELECT id FROM categories WHERE slug = 'elektronik'),
    'TECH-002',
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&h=500&fit=crop',
    4.8,
    87,
    true,
    true
  ),
  (
    'Hızlı Şarjlı Power Bank 20000mAh',
    'hizli-sarjli-power-bank',
    'Hızlı şarjlama teknolojisi, 2 USB port, kompakt tasarım, LED ekran',
    199.99,
    156,
    (SELECT id FROM categories WHERE slug = 'elektronik'),
    'TECH-003',
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&h=500&fit=crop',
    4.3,
    234,
    false,
    true
  ),
  (
    'Smart Watch Fitness Tracker',
    'smart-watch-fitness-tracker',
    'Kalp atışı monitörü, uyku takibi, 7 gün pil ömrü, su geçirmez, 50+ spor modu',
    449.99,
    67,
    (SELECT id FROM categories WHERE slug = 'elektronik'),
    'TECH-004',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
    4.6,
    156,
    false,
    true
  ),
  (
    'Taşınabilir Bluetooth Hoparlör',
    'tasinabilir-bluetooth-hoparlor',
    '360 derece ses, IPX7 su geçirmez, 12 saatlik pil, bas boost teknolojisi',
    349.99,
    89,
    (SELECT id FROM categories WHERE slug = 'elektronik'),
    'TECH-005',
    'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop',
    4.4,
    92,
    false,
    true
  );

-- 3. GIYIM ÜRÜNLER
INSERT INTO products (name, slug, description, price, stock, category_id, sku, image_url, rating, reviews_count, featured, is_active) VALUES
  (
    'Premium Denim Pantolon',
    'premium-denim-pantolon',
    '100% pamuk, confortable fit, bütün mevsim giyilebilir, klasik tasarım, uzun ömürlü',
    299.99,
    134,
    (SELECT id FROM categories WHERE slug = 'giyim-moda'),
    'CLOTH-001',
    'https://images.unsplash.com/photo-1542272604-787c62d465d1?w=500&h=500&fit=crop',
    4.5,
    167,
    false,
    true
  ),
  (
    'Erkek Spor Ayakkabı',
    'erkek-spor-ayakkabi',
    'Hafif, rahat, nefes alan malzeme, shock absorbing teknolojisi, tüm spor aktiviteleri için',
    549.99,
    78,
    (SELECT id FROM categories WHERE slug = 'giyim-moda'),
    'CLOTH-002',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
    4.7,
    203,
    true,
    true
  ),
  (
    'Kadın Yoga Takımı',
    'kadin-yoga-takimi',
    'Esnek, nem emici, anatomik tasarım, 4 renkli, hepsi size uyuyor',
    399.99,
    95,
    (SELECT id FROM categories WHERE slug = 'giyim-moda'),
    'CLOTH-003',
    'https://images.unsplash.com/photo-1506629082632-0e0b60603e04?w=500&h=500&fit=crop',
    4.6,
    145,
    false,
    true
  ),
  (
    'Kış Ceketi - Su Geçirmez',
    'kis-ceketi-su-gecirmez',
    'Termal iç astar, su geçirmez dış, rüzgar koruması, çok cepli, XS-XXL beden',
    799.99,
    56,
    (SELECT id FROM categories WHERE slug = 'giyim-moda'),
    'CLOTH-004',
    'https://images.unsplash.com/photo-1539533057440-7814a60d2c45?w=500&h=500&fit=crop',
    4.4,
    89,
    false,
    true
  );

-- 4. KİTAP ÜRÜNLER
INSERT INTO products (name, slug, description, price, stock, category_id, sku, image_url, rating, reviews_count, featured, is_active) VALUES
  (
    'Sapiens: İnsan Tarihine Yeni Bir Bakış',
    'sapiens-insan-tarihine-yeni-bakis',
    'Yuval Noah Harari''ın bestseller kitabı. İnsan evriminden modern döneme kadar kapsamlı bir bakış.',
    79.99,
    234,
    (SELECT id FROM categories WHERE slug = 'kitap'),
    'BOOK-001',
    'https://images.unsplash.com/photo-1507842217343-583f20270319?w=500&h=500&fit=crop',
    4.8,
    512,
    true,
    true
  ),
  (
    'Düşün ve Zengin Ol',
    'dusun-ve-zengin-ol',
    'Napoleon Hill''in klasik eserine ait geliştirilmiş versiyonu. Mali başarı için pratik rehber.',
    64.99,
    178,
    (SELECT id FROM categories WHERE slug = 'kitap'),
    'BOOK-002',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&h=500&fit=crop',
    4.6,
    389,
    false,
    true
  ),
  (
    'Bilim Kurgu: Kırmızı Gezegen',
    'bilim-kurgu-kirmizi-gezegen',
    'Andy Weir''in yazıncı ödül kazanan romanı. Ay'da sıkışan astronotun maceraları.',
    89.99,
    145,
    (SELECT id FROM categories WHERE slug = 'kitap'),
    'BOOK-003',
    'https://images.unsplash.com/photo-1495446815901-a7297e3b0f05?w=500&h=500&fit=crop',
    4.7,
    276,
    false,
    true
  ),
  (
    'Python Programlamaya Giriş',
    'python-programlamaya-giris',
    'Başlangıçtan ileri seviyeye Python öğrenin. 500+ sayfa, pratik örnekler ve projeler.',
    129.99,
    89,
    (SELECT id FROM categories WHERE slug = 'kitap'),
    'BOOK-004',
    'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=500&h=500&fit=crop',
    4.5,
    167,
    false,
    true
  );

-- 5. SPOR & OUTDOOR ÜRÜNLER
INSERT INTO products (name, slug, description, price, stock, category_id, sku, image_url, rating, reviews_count, featured, is_active) VALUES
  (
    'Profesyonel Yoga Matı',
    'profesyonel-yoga-mati',
    'Kaymaz yüzey, 6mm kalınlık, TPE malzeme, taşıma kayışlı, yoga ve pilates için ideal',
    149.99,
    112,
    (SELECT id FROM categories WHERE slug = 'spor-outdoor'),
    'SPORT-001',
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&h=500&fit=crop',
    4.4,
    198,
    false,
    true
  ),
  (
    'Çok Fonksiyonlu Zıplama Halatı',
    'cok-fonksiyonlu-ziplama-halatı',
    'Ayarlanabilir boy, hızlı top rulolar, dayanıklı halat, profesyonel veya rekreasyon amaçlı',
    59.99,
    267,
    (SELECT id FROM categories WHERE slug = 'spor-outdoor'),
    'SPORT-002',
    'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=500&h=500&fit=crop',
    4.3,
    134,
    false,
    true
  ),
  (
    'Kamp Çadırı 4-Kişilik',
    'kamp-cadiri-4-kisili',
    'Su geçirmez, UV koruması, 2 kat kumaş, çift havalandırma, taşıma çantası dahil',
    599.99,
    34,
    (SELECT id FROM categories WHERE slug = 'spor-outdoor'),
    'SPORT-003',
    'https://images.unsplash.com/photo-1532274040911-5f82f1fbb457?w=500&h=500&fit=crop',
    4.6,
    156,
    true,
    true
  );

-- 6. EV & YAŞAM ÜRÜNLER
INSERT INTO products (name, slug, description, price, stock, category_id, sku, image_url, rating, reviews_count, featured, is_active) VALUES
  (
    'Minimalist Tasarım Sandalye',
    'minimalist-tasarim-sandalye',
    'Ergonomik tasarım, yüksek kaliteli deri, metal ayaklar, 5 renk seçeneği',
    1299.99,
    28,
    (SELECT id FROM categories WHERE slug = 'ev-yasam'),
    'HOME-001',
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=500&fit=crop',
    4.7,
    89,
    false,
    true
  ),
  (
    'LED Dekoratif Işık Şeridi',
    'led-dekoratif-isik-seridi',
    '5 metre, 16 milyon renk, WiFi kontrollü, müzik senkronizasyonu, haftaya göre zamanlama',
    149.99,
    201,
    (SELECT id FROM categories WHERE slug = 'ev-yasam'),
    'HOME-002',
    'https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=500&h=500&fit=crop',
    4.5,
    267,
    true,
    true
  ),
  (
    'Organik Pamuk Yatak Seti',
    'organik-pamuk-yatak-seti',
    '400 TC, tüm sezonlar, hypoallergenic, 4 parça set (çarşaf, yastık, yorgan), makinede yıkanabilir',
    399.99,
    156,
    (SELECT id FROM categories WHERE slug = 'ev-yasam'),
    'HOME-003',
    'https://images.unsplash.com/photo-1540932239986-310128078ceb?w=500&h=500&fit=crop',
    4.6,
    178,
    false,
    true
  );

-- ================================================================
-- Kontrol Sorguları (çalıştırıp sonuçları görmek için)
-- ================================================================

-- Tüm kategorileri listele
SELECT COUNT(*) as "Kategori Sayısı" FROM categories;

-- Tüm ürünleri listele
SELECT COUNT(*) as "Ürün Sayısı" FROM products;

-- Kategori başına ürün sayısı
SELECT c.name as "Kategori", COUNT(p.id) as "Ürün Sayısı"
FROM categories c
LEFT JOIN products p ON c.id = p.category_id
GROUP BY c.id, c.name
ORDER BY COUNT(p.id) DESC;

-- En yüksek fiyatlı ürünler
SELECT name, price, category_id FROM products ORDER BY price DESC LIMIT 5;
