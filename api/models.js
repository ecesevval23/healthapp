export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        
        if (!apiKey) {
            return res.status(500).json({ error: 'Sunucuda API anahtarı yapılandırılmamış (GEMINI_API_KEY eksik).' });
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

        const response = await fetch(url);

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Google API Hatası: ${response.status} ${errorData}`);
        }

        const data = await response.json();
        return res.status(200).json(data);
        
    } catch (error) {
        console.error('Serverless Function Hatası:', error);
        return res.status(500).json({ error: error.message });
    }
}
