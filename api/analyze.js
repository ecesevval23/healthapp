export default async function handler(req, res) {
    // Sadece POST isteklerine izin veriyoruz
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // Vercel Environment Variables'dan API anahtarını alıyoruz
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'Sunucuda API anahtarı yapılandırılmamış (GEMINI_API_KEY eksik).' });
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

        const payload = req.body;
        const menuLinkUrl = payload.menuLinkUrl;
        delete payload.menuLinkUrl; // Gemini API'sine gitmemesi için siliyoruz

        if (menuLinkUrl) {
            try {
                // Linkin içeriğini sunucu tarafında çekiyoruz
                const siteResponse = await fetch(menuLinkUrl);
                const html = await siteResponse.text();
                
                // Basit bir HTML temizliği (script, style ve etiketleri atıp sadece metni alıyoruz)
                let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ');
                text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ');
                text = text.replace(/<[^>]+>/g, ' ');
                text = text.replace(/\s+/g, ' ').trim();
                
                // Metni Gemini'ye gönderilecek parçalara ekliyoruz
                if (payload.contents && payload.contents[0] && payload.contents[0].parts) {
                    payload.contents[0].parts.push({ 
                        text: `Aşağıdaki metin, kullanıcının girdiği ${menuLinkUrl} adresli web sitesinin menü/sayfa içeriğidir. Lütfen bu içeriği analiz et:\n\n${text.substring(0, 10000)}` 
                    });
                }
            } catch (err) {
                console.error("Link fetch error:", err);
                if (payload.contents && payload.contents[0] && payload.contents[0].parts) {
                    payload.contents[0].parts.push({ 
                        text: `(Uyarı: ${menuLinkUrl} adresindeki menü okunamadı, erişim engeli olabilir.)` 
                    });
                }
            }
        }

        // Gelen isteği (payload) doğrudan Gemini'a yönlendiriyoruz
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Google API Hatası: ${response.status} ${errorData}`);
        }

        // Gemini'dan gelen yanıtı aynen frontend'e döndürüyoruz
        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        console.error('Serverless Function Hatası:', error);
        return res.status(500).json({ error: error.message });
    }
}
