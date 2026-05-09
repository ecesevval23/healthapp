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

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        // Gelen isteği (payload) doğrudan Gemini'a yönlendiriyoruz
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body) // app.js'den gelen body
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
