# EduSync Phase Execution Plan

Durum tarihi: 2026-02-23

## Faz 0 - Stabilizasyon (Tamamlandı)

Amaç: Geliştirme tabanını kırılmadan ilerletecek minimum teknik sağlamlığı sağlamak.

- [x] API typecheck hatalarını gider
- [x] DB fallback bağlantı stringlerini docker/.env varsayılanıyla hizala
- [x] Messaging modülündeki ham SQL akışını güvenli hale getir
- [x] Workspace typecheck çalıştır ve doğrula

Çıktı: `npm run typecheck` temiz.

## Faz 1 - Doküman Uyum Sertleştirme (Başlatılacak)

Amaç: Faz 1 + 1.5 backend’ini dokümandaki mimari sözleşmeye daha sıkı hale getirmek.

1. Tenant izolasyonu standardizasyonu
2. Audit log kapsamını modül bazında tamamla
3. `.env` yükleme stratejisini netleştir ve kodda sabitle
4. Auth permission modelini (role-permission mapping) aktif et
5. Modül bazlı smoke test seti ekle (auth/students/attendance/messaging)

Kabul kriterleri:

- Tenant sızıntısı oluşturabilecek endpoint kalmaması
- CREATE/UPDATE/DELETE kritik operasyonlarında standart audit log
- Yeni geliştirici için tek komutta aynı ortam kurulumu

## Faz 2 - Web Panelleri (School + Super Admin)

Amaç: Dokümanda tanımlanan Faz 2 web yüzlerini API ile entegre etmek.

1. UI teknoloji kararı ve proje bootstrap
2. Auth/session yönetimi
3. School admin çekirdek ekranları (students, attendance, announcements, meals, schedules)
4. Super admin ekranları (tenants, subscriptions, plan yönetimi)
5. Route-level permission guard + data fetching standardı

## Faz 3 - Mobil Uygulama (Expo)

Amaç: Veli ve öğretmen odaklı minimum mobil deneyimi canlıya hazır hale getirmek.

1. Auth ve rol bazlı navigation
2. Parent akışları: attendance/announcements/meals/messages
3. Teacher akışları: attendance/messages
4. Push notification altyapısı

## Faz 4 - Genişletilmiş Modüller

- Finans
- Servis takibi
- Dijital portfolyo
- Not/karne sistemi

## Faz 5 - AI ve İleri Özellikler

- Analitik + öneri motorları
- Akıllı zamanlama
- Chatbot entegrasyonları

## Çalışma Şekli (Önerilen)

1. Her faz için ayrı kısa teknik tasarım notu (`docs/faz-x-design.md`)
2. Her modül için net DoD (Definition of Done)
3. Her PR için typecheck + temel smoke test zorunluluğu
4. Faz sonunda “doküman güncelleme” adımı
