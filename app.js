document.addEventListener('DOMContentLoaded', () => {
    // App State
    const state = {
        preferences: [],
        currentCategory: null,
        capturedImageBase64: null,
        scannedQRText: null,
        menuLinkUrl: null,
        userNote: ''
    };

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
        state.menuLinkUrl = null;
        state.userNote = '';
        cameraContainer.classList.add('hidden');
        cameraPreview.classList.add('hidden');
        optionsContainer.classList.remove('hidden');

        // Option 1: Selected 'Alışveriş'
        if (category === 'Alışveriş') {
            title.textContent = 'Market Ürünü';
            icon.textContent = '🛒';
            
            optionsContainer.innerHTML = `
                <div class="h-full flex flex-col justify-center space-y-4">
                    <button id="btn-open-camera" class="w-full bg-gray-50 border-2 border-dashed border-primary/50 p-8 rounded-3xl flex flex-col items-center justify-center text-gray-600 hover:bg-primary/5 hover:border-primary transition-colors group">
                        <div class="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <svg class="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <span class="font-bold text-xl text-gray-800 mb-2">İçindekiler Kısmını Çek</span>
                        <span class="text-sm text-gray-500 text-center px-4">Ürünün arka yüzündeki metni okutun</span>
                    </button>

                    <button id="btn-upload-gallery" class="w-full bg-gray-50 border border-gray-200 p-4 rounded-[1.5rem] flex items-center justify-center text-center hover:border-primary hover:bg-primary/5 hover:shadow-md transition-all group">
                        <span class="text-2xl mr-3">🖼️</span>
                        <span class="font-bold text-sm text-gray-800">Galeriden Ürün Fotoğrafı Seç</span>
                    </button>
                    <input type="file" id="file-upload-input" accept="image/*" class="hidden">
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

                <button id="btn-upload-gallery" class="w-full bg-gray-50 border border-gray-200 p-4 mb-4 rounded-[1.5rem] flex items-center justify-center text-center hover:border-primary hover:bg-primary/5 hover:shadow-md transition-all group">
                    <span class="text-2xl mr-3">🖼️</span>
                    <span class="font-bold text-sm text-gray-800">Galeriden Menü Fotoğrafı Seç</span>
                </button>
                <input type="file" id="file-upload-input" accept="image/*" class="hidden">

                <button id="btn-open-link" class="w-full bg-gray-50 border border-gray-200 p-4 mb-4 rounded-[1.5rem] flex items-center justify-center text-center hover:border-primary hover:bg-primary/5 hover:shadow-md transition-all group">
                    <span class="text-2xl mr-3">🔗</span>
                    <span class="font-bold text-sm text-gray-800">İnternet Linki (URL) Gir</span>
                </button>

                <div id="link-input-container" class="hidden bg-gray-50 p-4 rounded-[1.5rem] border border-gray-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all mb-4">
                    <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Menü Web Adresi</label>
                    <input type="url" id="menu-url-input" class="w-full border-none focus:ring-0 p-0 text-sm text-gray-700 outline-none bg-transparent placeholder-gray-400" placeholder="https://ornek-menu.com/menu">
                </div>
                
                <div class="bg-gray-50 p-4 rounded-[1.5rem] border border-gray-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all mt-4">
                    <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Canın Ne Çekiyor? (Opsiyonel)</label>
                    <textarea id="user-note" class="w-full border-none focus:ring-0 p-0 text-sm text-gray-700 resize-none h-16 outline-none bg-transparent placeholder-gray-400" placeholder="Örn: Çikolatalı, hafif bir tatlı..."></textarea>
                </div>
            `;

            // Setup listeners
            document.getElementById('user-note')?.addEventListener('input', (e) => {
                state.userNote = e.target.value;
            });

            const linkInputContainer = document.getElementById('link-input-container');
            const menuUrlInput = document.getElementById('menu-url-input');
            const btnOpenLink = document.getElementById('btn-open-link');

            btnOpenLink?.addEventListener('click', () => {
                linkInputContainer.classList.toggle('hidden');
            });

            menuUrlInput?.addEventListener('input', (e) => {
                state.menuLinkUrl = e.target.value;
            });
        }

        // Add Listeners
        const btnOpenCamera = document.getElementById('btn-open-camera');
        if (btnOpenCamera) btnOpenCamera.addEventListener('click', startCamera);

        const btnOpenQR = document.getElementById('btn-open-qr');
        if (btnOpenQR) btnOpenQR.addEventListener('click', startQRScanner);

        const btnUploadGallery = document.getElementById('btn-upload-gallery');
        const fileUploadInput = document.getElementById('file-upload-input');
        
        if (btnUploadGallery && fileUploadInput) {
            btnUploadGallery.addEventListener('click', () => {
                fileUploadInput.click();
            });

            fileUploadInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        state.capturedImageBase64 = event.target.result;
                        
                        const optionsContainer = document.getElementById('scanner-options');
                        optionsContainer.classList.add('hidden');
                        cameraContainer.classList.remove('hidden');
                        cameraContainer.classList.add('flex');
                        
                        cameraVideo.classList.add('hidden');
                        qrReaderDiv.classList.add('hidden');
                        cameraPreview.src = event.target.result;
                        cameraPreview.classList.remove('hidden');
                        btnCapture.classList.add('hidden');
                        btnRetake.classList.remove('hidden');
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
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
        if (!state.capturedImageBase64 && !state.scannedQRText && !state.menuLinkUrl) {
            alert('Lütfen fotoğraf çekin, QR okutun veya bir menü linki girin!');
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
        const url = '/api/analyze';
        
        let parts = [];
        
        const profileInfo = state.preferences.length > 0 
            ? state.preferences.join(', ') 
            : 'Herhangi bir sağlık sorunu veya diyet kısıtlaması yok (Her şeyi yiyebilir).';

        const systemInstruction = `Bir gıda/menü uzmanı gibi davran. Görüntüdeki veya metindeki içerikleri analiz et.
Kullanıcının profili: [${profileInfo}]
Kullanıcının anlık isteği/damak zevki: [${state.userNote || 'Belirtilmedi'}]

Talimatlar:
1. SADECE VE SADECE SANA VERİLEN MENÜDE (metin veya görsel) YER ALAN ÜRÜNLERİ DEĞERLENDİR. Menüde açıkça yazmayan hiçbir ürünü "varsa, eklenirse, şekersizse" gibi varsayımlarla önerme. Olmayan ürünler uydurma.
2. Eğer kullanıcının özel bir diyet kısıtlaması (Diyabet vb.) VARSA, menüdeki ürünleri buna göre filtrele. Kullanıcının anlık isteği (örn. "çilekli") bu kısıtlamalarla çelişiyorsa (örn. çilekli pastalar şekerlidir), kullanıcının isteğine uyan ama sağlığına zararlı olan ürünleri "Riskli" (Kırmızı) olarak belirt ve nedenini açıkla.
3. Kullanıcının sağlık kısıtlamalarına uyan hiçbir çilekli/istediği ürün yoksa, menüde gerçekten var olan en sağlıklı alternatifleri "Güvenli" (Yeşil) olarak öner.
4. Eğer kullanıcının HİÇBİR kısıtlaması YOKSA, kalorili yiyecekleri gereksiz yere "Riskli" işaretleme, anlık isteğine en uygun menü öğelerini doğrudan "Güvenli" olarak öner.

Yanıtı BANA KESİNLİKLE SADECE AŞAĞIDAKİ JSON ARRAY FORMATINDA DÖN, markdown (\`\`\`json vb.) KULLANMA, DOĞRUDAN DİZİ (ARRAY) DÖN:
[
  {
    "durum": "kirmizi", // kirmizi, sari veya yesil olabilir
    "baslik": "Ürün Adı veya Kategori",
    "mesaj": "Açıklama burada..."
  }
]`;

        parts.push({ text: systemInstruction });

        if (state.scannedQRText) {
            parts.push({ text: `Menü/Ürün içeriği metni: ${state.scannedQRText}` });
        }
        
        if (state.capturedImageBase64) {
            const base64Data = state.capturedImageBase64.split(',')[1];
            parts.push({
                inlineData: {
                    mimeType: "image/jpeg",
                    data: base64Data
                }
            });
        }

        const payload = {
            contents: [{ parts: parts }],
            generationConfig: {
                responseMimeType: "application/json"
            }
        };

        if (state.menuLinkUrl) {
            payload.menuLinkUrl = state.menuLinkUrl;
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            let errorMessage = errorData.error || 'Bilinmeyen hata';
            
            if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
                throw new Error("Çok fazla istek attınız (API Hız Limiti). Lütfen yaklaşık 1 dakika bekleyip tekrar deneyin.");
            }
            
            throw new Error(`API Hatası: ${response.status} - ${errorMessage}`);
        }

        const data = await response.json();
        let textResult = data.candidates[0].content.parts[0].text;
        
        try {
            // Clean up possible markdown wrappers if Gemini ignores instructions
            textResult = textResult.replace(/```json/gi, '').replace(/```/g, '').trim();
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
