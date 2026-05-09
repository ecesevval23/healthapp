document.addEventListener('DOMContentLoaded', () => {
    // App State
    const state = {
        preferences: [],
        currentCategory: null,
        capturedImageBase64: null,
        scannedQRText: null,
        userNote: ''
    };

    const API_KEY = "AIzaSyCncT7-zAmloSpIOdD5OzQkn7FejJgc7jg";

    // DOM Elements Map
    const screens = {
        profile: document.getElementById('screen-profile'),
        dashboard: document.getElementById('screen-dashboard'),
        scanner: document.getElementById('screen-scanner'),
        loading: document.getElementById('screen-loading'),
        results: document.getElementById('screen-results')
    };

    // Navigation Helper
    const showScreen = (screenName) => {
        Object.values(screens).forEach(s => {
            if(s) s.classList.remove('active');
        });
        if(screens[screenName]) {
            screens[screenName].classList.add('active');
            
            // Trigger reflow for animations
            screens[screenName].style.animation = 'none';
            screens[screenName].offsetHeight; /* trigger reflow */
            screens[screenName].style.animation = null; 
        }
    };

    // ==========================================
    // Screen 1: Profile Logic
    // ==========================================
    // Camera & QR Elements
    const cameraContainer = document.getElementById('camera-container');
    const cameraVideo = document.getElementById('camera-video');
    const cameraCanvas = document.getElementById('camera-canvas');
    const cameraPreview = document.getElementById('camera-preview');
    const qrReaderDiv = document.getElementById('qr-reader');
    const btnCapture = document.getElementById('btn-capture');
    const btnRetake = document.getElementById('btn-retake');
    const btnStopCamera = document.getElementById('btn-stop-camera');
    
    let videoStream = null;
    let html5QrcodeScanner = null;

    const btnSaveProfile = document.getElementById('btn-save-profile');
    btnSaveProfile.addEventListener('click', () => {
        const checkboxes = document.querySelectorAll('#screen-profile input[type="checkbox"]:checked');
        state.preferences = Array.from(checkboxes).map(cb => cb.value);
        showScreen('dashboard');
    });

    // ==========================================
    // Screen 2: Dashboard Logic
    // ==========================================
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const category = e.currentTarget.getAttribute('data-category');
            state.currentCategory = category;
            setupScannerScreen(category);
            showScreen('scanner');
        });
    });

    // ==========================================
    // Screen 3: Scanner Logic
    // ==========================================
    const btnBackScanner = document.getElementById('btn-back-scanner');
    btnBackScanner.addEventListener('click', () => {
        stopAllCameras();
        showScreen('dashboard');
    });

    const setupScannerScreen = (category) => {
        const title = document.getElementById('scanner-title');
        const icon = document.getElementById('scanner-icon');
        const optionsContainer = document.getElementById('scanner-options');
        
        optionsContainer.innerHTML = ''; // Reset

        // Reset states
        state.capturedImageBase64 = null;
        state.scannedQRText = null;
        state.userNote = '';
        cameraContainer.classList.add('hidden');
        cameraPreview.classList.add('hidden');
        optionsContainer.classList.remove('hidden');

        // Option 1: Selected 'Alışveriş'
        if (category === 'Alışveriş') {
            title.textContent = 'Market Ürünü';
            icon.textContent = '🛒';
            
            optionsContainer.innerHTML = `
                <div class="h-full flex flex-col justify-center">
                    <button id="btn-open-camera" class="w-full bg-gray-50 border-2 border-dashed border-primary/50 p-10 rounded-3xl flex flex-col items-center justify-center text-gray-600 hover:bg-primary/5 hover:border-primary transition-colors group">
                        <div class="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <svg class="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <span class="font-bold text-xl text-gray-800 mb-2">İçindekiler Kısmını Çek</span>
                        <span class="text-sm text-gray-500 text-center px-4">Ürünün arka yüzündeki metni okutun</span>
                    </button>
                </div>
            `;
        } 
        // Option 2: Selected 'Cafe' or 'Restoran'
        else {
            title.textContent = category === 'Cafe' ? 'Cafe Menüsü' : 'Restoran Menüsü';
            icon.textContent = category === 'Cafe' ? '☕' : '🍽️';

            optionsContainer.innerHTML = `
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <button id="btn-open-qr" class="bg-gray-50 border border-gray-200 p-6 rounded-[1.5rem] flex flex-col items-center justify-center text-center hover:border-primary hover:bg-primary/5 hover:shadow-md transition-all group h-40">
                        <div class="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <svg class="w-6 h-6 text-gray-600 group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                            </svg>
                        </div>
                        <span class="font-bold text-sm text-gray-800">QR Menü Okut</span>
                    </button>
                    
                    <button id="btn-open-camera" class="bg-gray-50 border border-gray-200 p-6 rounded-[1.5rem] flex flex-col items-center justify-center text-center hover:border-primary hover:bg-primary/5 hover:shadow-md transition-all group h-40">
                        <div class="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <svg class="w-6 h-6 text-gray-600 group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            </svg>
                        </div>
                        <span class="font-bold text-sm text-gray-800">Fiziksel Menü Fotoğrafla</span>
                    </button>
                </div>
                
                <div class="bg-gray-50 p-4 rounded-[1.5rem] border border-gray-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all mt-4">
                    <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Canın Ne Çekiyor? (Opsiyonel)</label>
                    <textarea id="user-note" class="w-full border-none focus:ring-0 p-0 text-sm text-gray-700 resize-none h-16 outline-none bg-transparent placeholder-gray-400" placeholder="Örn: Çikolatalı, hafif bir tatlı..."></textarea>
                </div>
            `;

            // Setup note listener
            document.getElementById('user-note')?.addEventListener('input', (e) => {
                state.userNote = e.target.value;
            });
        }

        // Add Listeners
        const btnOpenCamera = document.getElementById('btn-open-camera');
        if (btnOpenCamera) btnOpenCamera.addEventListener('click', startCamera);

        const btnOpenQR = document.getElementById('btn-open-qr');
        if (btnOpenQR) btnOpenQR.addEventListener('click', startQRScanner);
    };

    // ==========================================
    // Camera & QR Implementations
    // ==========================================
    const startCamera = async () => {
        const optionsContainer = document.getElementById('scanner-options');
        optionsContainer.classList.add('hidden');
        cameraContainer.classList.remove('hidden');
        cameraContainer.classList.add('flex');
        
        cameraVideo.classList.remove('hidden');
        btnCapture.classList.remove('hidden');
        btnRetake.classList.add('hidden');
        cameraPreview.classList.add('hidden');
        qrReaderDiv.classList.add('hidden');

        try {
            videoStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            cameraVideo.srcObject = videoStream;
        } catch (err) {
            alert('Kameraya erişilemedi: ' + err.message);
            stopAllCameras();
        }
    };

    btnCapture.addEventListener('click', () => {
        cameraCanvas.width = cameraVideo.videoWidth;
        cameraCanvas.height = cameraVideo.videoHeight;
        cameraCanvas.getContext('2d').drawImage(cameraVideo, 0, 0, cameraCanvas.width, cameraCanvas.height);
        
        const base64Image = cameraCanvas.toDataURL('image/jpeg', 0.8);
        state.capturedImageBase64 = base64Image;
        
        cameraPreview.src = base64Image;
        cameraPreview.classList.remove('hidden');
        cameraVideo.classList.add('hidden');
        
        btnCapture.classList.add('hidden');
        btnRetake.classList.remove('hidden');

        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop());
            videoStream = null;
        }
    });

    btnRetake.addEventListener('click', () => {
        state.capturedImageBase64 = null;
        startCamera();
    });

    const startQRScanner = () => {
        const optionsContainer = document.getElementById('scanner-options');
        optionsContainer.classList.add('hidden');
        cameraContainer.classList.remove('hidden');
        cameraContainer.classList.add('flex');
        
        qrReaderDiv.classList.remove('hidden');
        cameraVideo.classList.add('hidden');
        cameraPreview.classList.add('hidden');
        btnCapture.classList.add('hidden');
        btnRetake.classList.add('hidden');

        if (!html5QrcodeScanner) {
            html5QrcodeScanner = new Html5Qrcode("qr-reader");
        }

        html5QrcodeScanner.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText, decodedResult) => {
                state.scannedQRText = decodedText;
                stopAllCameras();
                
                optionsContainer.classList.remove('hidden');
                cameraContainer.classList.add('hidden');
                
                const qrBtn = document.getElementById('btn-open-qr');
                if(qrBtn) {
                    qrBtn.innerHTML = '<div class="text-4xl mb-2">✅</div><span class="font-bold text-sm text-green-600">QR Okundu</span>';
                    qrBtn.classList.add('border-green-500', 'bg-green-50');
                }
            },
            (errorMessage) => {
                // Ignore errors
            }
        ).catch((err) => {
            alert('QR okuyucu başlatılamadı: ' + err.message);
            stopAllCameras();
        });
    };

    const stopAllCameras = () => {
        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop());
            videoStream = null;
        }
        if (html5QrcodeScanner) {
            html5QrcodeScanner.stop().catch(e => console.error(e));
            html5QrcodeScanner = null;
        }
        
        const optionsContainer = document.getElementById('scanner-options');
        optionsContainer.classList.remove('hidden');
        cameraContainer.classList.add('hidden');
        cameraContainer.classList.remove('flex');
    };

    btnStopCamera.addEventListener('click', stopAllCameras);

    const btnScan = document.getElementById('btn-scan');
    btnScan.addEventListener('click', async () => {
        if (!state.capturedImageBase64 && !state.scannedQRText) {
            alert('Lütfen önce bir fotoğraf çekin veya QR okutun!');
            return;
        }

        showScreen('loading');

        try {
            await analyzeWithGemini();
            showScreen('results');
        } catch (error) {
            alert('Analiz sırasında hata oluştu: ' + error.message);
            showScreen('scanner');
        }
    });

    const analyzeWithGemini = async () => {
        const url = \`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=\${API_KEY}\`;
        
        let parts = [];
        
        const systemInstruction = \`Bir gıda/menü uzmanı gibi davran. Görüntüdeki veya metindeki içerikleri analiz et.
Kullanıcının şu sağlık profiline [\${state.preferences.join(', ') || 'Belirtilmedi'}] göre:
1. Riskli maddeleri bul.
2. Neden riskli olduğunu açıkla.
3. Eğer Cafe/Restoran ise kullanıcının şu damak zevki isteğine [\${state.userNote || 'Belirtilmedi'}] göre uygun yemekleri öner.
Yanıtı BANA KESİNLİKLE SADECE AŞAĞIDAKİ JSON ARRAY FORMATINDA DÖN, markdown ( \`\`\`json vb.) KULLANMA, DOĞRUDAN DİZİ (ARRAY) DÖN:
[
  {
    "durum": "kirmizi",
    "baslik": "Riskli Ürün",
    "mesaj": "Açıklama burada..."
  }
]\`;

        parts.push({ text: systemInstruction });

        if (state.scannedQRText) {
            parts.push({ text: \`Menü/Ürün içeriği: \${state.scannedQRText}\` });
        }

        if (state.capturedImageBase64) {
            const base64Data = state.capturedImageBase64.split(',')[1];
            parts.push({
                inline_data: {
                    mime_type: "image/jpeg",
                    data: base64Data
                }
            });
        }

        const payload = {
            contents: [{ parts: parts }],
            generationConfig: {
                response_mime_type: "application/json"
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(\`API Hatası: \${response.status}\`);
        }

        const data = await response.json();
        let textResult = data.candidates[0].content.parts[0].text;
        
        try {
            // Clean up possible markdown wrappers if Gemini ignores instructions
            textResult = textResult.replace(/\\`\\`\\`json/g, '').replace(/\\`\\`\\`/g, '').trim();
            const parsedResults = JSON.parse(textResult);
            renderGeminiResults(parsedResults);
        } catch (e) {
            console.error('JSON Parse Error:', e, textResult);
            throw new Error('Gemini JSON formatında yanıt vermedi.');
        }
    };

    // ==========================================
    // Screen 5: Results Logic
    // ==========================================
    const btnBackHome = document.getElementById('btn-back-home');
    btnBackHome.addEventListener('click', () => showScreen('dashboard'));

    const renderGeminiResults = (resultsArray) => {
        const prefContext = document.getElementById('pref-context');
        const container = document.getElementById('results-container');
        
        container.innerHTML = '';
        prefContext.innerHTML = '';

        if (state.preferences.length > 0) {
            prefContext.innerHTML = `
                <div class="mb-4 text-xs font-medium bg-emerald-50 text-emerald-800 px-4 py-3 rounded-xl border border-emerald-100 flex items-center gap-3">
                    <div class="bg-white p-1 rounded-full shadow-sm shrink-0">
                        <svg class="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <span><strong>${state.preferences.join(', ')}</strong> kriterlerinize göre AI tarafından analiz edildi.</span>
                </div>
            `;
        }

        if (!Array.isArray(resultsArray) || resultsArray.length === 0) {
            container.innerHTML = `<div class="p-4 bg-gray-100 rounded-xl text-center text-gray-600">Herhangi bir sonuç bulunamadı. Lütfen fotoğrafı daha net çekmeyi deneyin.</div>`;
            return;
        }

        let itemsHTML = '';
        
        resultsArray.forEach(item => {
            const durum = item.durum ? item.durum.toLowerCase() : 'sari';
            
            let colorTheme = { bg: 'bg-warning', light: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-600', dot: 'bg-warning', label: 'Dikkat' };
            
            if (durum.includes('kirmizi') || durum.includes('red')) {
                colorTheme = { bg: 'bg-danger', light: 'bg-red-50', border: 'border-red-100', text: 'text-danger', dot: 'bg-danger animate-pulse', label: 'Riskli' };
            } else if (durum.includes('yesil') || durum.includes('green')) {
                colorTheme = { bg: 'bg-safe', light: 'bg-green-50', border: 'border-green-100', text: 'text-safe', dot: 'bg-safe', label: 'Güvenli' };
            }

            itemsHTML += `
                <div class="bg-white rounded-[1.5rem] p-5 border border-gray-100 shadow-sm relative overflow-hidden mb-4">
                    <div class="absolute left-0 top-0 bottom-0 w-2 ${colorTheme.bg}"></div>
                    <div class="flex justify-between items-start ml-2">
                        <div class="pr-3">
                            <h3 class="font-bold text-gray-800 text-lg mb-1">${item.baslik || 'Sonuç'}</h3>
                            <p class="text-sm text-gray-600 leading-snug">${item.mesaj}</p>
                        </div>
                        <span class="${colorTheme.light} ${colorTheme.text} text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border ${colorTheme.border} whitespace-nowrap shrink-0">
                            <span class="w-2 h-2 rounded-full ${colorTheme.dot}"></span> ${colorTheme.label}
                        </span>
                    </div>
                </div>
            `;
        });

        container.innerHTML = itemsHTML;
    };
});
