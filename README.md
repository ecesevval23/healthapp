# 🍏 Kişiselleştirilmiş Gıda ve Sağlık Tarayıcısı (AI Food Scanner)

Yapay zeka destekli bu mobil uyumlu web uygulaması, kullanıcıların sağlık profillerine (Glüten intoleransı, Vegan vb.) göre gıda ürünlerini ve restoran menülerini saniyeler içinde analiz eder. Google Gemini AI gücüyle çalışan uygulama; barkod okuma, canlı kamera üzerinden içerik tanıma ve menü linki analizi özelliklerine sahiptir.

## ✨ Özellikler

- **Kişiselleştirilmiş Sağlık Profili:** Kullanıcılar Vegan, Vejetaryen, Diyabet, Glüten İntoleransı, Deniz Ürünleri Alerjisi vb. diyet gereksinimlerini seçerek kendilerine özel analiz sonuçları alırlar.
- **Canlı Kamera Analizi:** Telefonunuzun kamerası ile herhangi bir market ürününün "İçindekiler" kısmının fotoğrafını çekerek içindeki zararlı maddeleri anında tespit edebilirsiniz.
- **QR Menü Okuyucu:** Kafelerde veya restoranlarda masada bulunan QR kodları okutarak tüm menüyü otomatik olarak içeri aktarabilirsiniz.
- **URL Üzerinden Menü Analizi:** Herhangi bir restoranın menü internet sitesinin linkini yapıştırarak, menüdeki sağlıklı ve riskli yiyecekleri sınıflandırabilirsiniz.
- **Yapay Zeka (Google Gemini 2.5 Flash):** Güçlü LLM entegrasyonu sayesinde ürünler detaylıca incelenir ve Yeşil (Güvenli), Sarı (Dikkat), Kırmızı (Riskli) kartlar halinde kullanıcı dostu bir arayüzle sunulur.

## 🛠️ Teknolojiler

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla JS)
- **Tasarım / Stil:** Tailwind CSS (CDN üzerinden)
- **Donanım Entegrasyonu:** HTML5 MediaDevices API (Kamera) & `html5-qrcode`
- **Backend / API:** Vercel Serverless Functions (Node.js)
- **Yapay Zeka:** Google Gemini 2.5 Flash REST API

## 🚀 Kurulum ve Çalıştırma

Projede API anahtarı güvenliği için **Vercel Serverless Functions** kullanılmıştır. Bu nedenle uygulamayı yerelde veya sunucuda çalıştırmak için aşağıdaki adımları izleyin:

### Gereksinimler
- Google AI Studio'dan alınmış bir **Gemini API Anahtarı**
- Bir [Vercel](https://vercel.com/) hesabı
- Yerel geliştirme ortamı için (Vercel CLI veya Live Server)

### 1. Vercel Üzerinde Canlıya Alma (Önerilen)
1. Bu depoyu kendi GitHub hesabınıza yükleyin veya *fork* edin.
2. Vercel paneline giriş yapın ve "Add New Project" diyerek GitHub'daki deponuzu seçin.
3. Dağıtım (Deploy) işlemi başlamadan önce **Environment Variables** (Ortam Değişkenleri) kısmına gelin.
4. **Key** olarak `GEMINI_API_KEY` yazın ve **Value** olarak kendi API anahtarınızı yapıştırın.
5. "Deploy" butonuna basarak projenizi canlı yayına alın. Vercel, `api/` klasöründeki dosyayı otomatik olarak güvenli bir backend sunucusuna çevirecektir.

### 2. Yerelde (Local) Çalıştırma
Uygulamayı bilgisayarınızda çalıştırmak için Node.js ve Vercel CLI kurulu olmalıdır. Terminalinizde şu komutları çalıştırın:
```bash
# Vercel CLI'ı kurun (Zaten kuruluysa atlayın)
npm i -g vercel

# Proje dizininde Vercel geliştirme sunucusunu başlatın
vercel dev
```
*(Not: `vercel dev` komutunu çalıştırmadan önce proje ana dizininde bir `.env` dosyası oluşturup içine `GEMINI_API_KEY=sizin_sifreniz` eklemeyi unutmayın.)*

> **⚠️ Güvenlik Uyarısı:** Tarayıcı güvenlik politikaları gereği, kamera ve QR okuyucu özellikleri sadece güvenli bağlantılarda (**HTTPS** veya **localhost**) çalışmaktadır. HTML dosyasını masaüstünden doğrudan çift tıklayarak (`file:///`) açarsanız tarayıcı kameranıza izin vermez.

## 📂 Proje Yapısı

```text
├── api/
│   └── analyze.js       # Vercel Serverless API (Gemini isteklerini güvenle yönetir)
├── index.html           # Uygulamanın mobil arayüz tasarımı
├── app.js               # Kamera, QR tarama ve ekran yönlendirmeleri
├── .gitignore           # Git ignore kuralları
└── README.md            # Proje dökümantasyonu
```

## 🤝 Katkıda Bulunma
Bu proje açık kaynaklı bir prototiptir. Hatalar, iyileştirmeler veya yeni özellik istekleri için her türlü Pull Request'e açıktır.
