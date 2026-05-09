document.addEventListener('DOMContentLoaded', () => {
    // App State
    const state = {
        preferences: [],
        currentCategory: null
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
    btnBackScanner.addEventListener('click', () => showScreen('dashboard'));

    const setupScannerScreen = (category) => {
        const title = document.getElementById('scanner-title');
        const icon = document.getElementById('scanner-icon');
        const optionsContainer = document.getElementById('scanner-options');
        
        optionsContainer.innerHTML = ''; // Reset

        // Option 1: Selected 'Alışveriş'
        if (category === 'Alışveriş') {
            title.textContent = 'Market Ürünü';
            icon.textContent = '🛒';
            
            optionsContainer.innerHTML = `
                <div class="h-full flex flex-col justify-center">
                    <button class="w-full bg-gray-50 border-2 border-dashed border-primary/50 p-10 rounded-3xl flex flex-col items-center justify-center text-gray-600 hover:bg-primary/5 hover:border-primary transition-colors group">
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
                    <button class="bg-gray-50 border border-gray-200 p-6 rounded-[1.5rem] flex flex-col items-center justify-center text-center hover:border-primary hover:bg-primary/5 hover:shadow-md transition-all group h-40">
                        <div class="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <svg class="w-6 h-6 text-gray-600 group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                            </svg>
                        </div>
                        <span class="font-bold text-sm text-gray-800">QR Menü Okut</span>
                    </button>
                    
                    <button class="bg-gray-50 border border-gray-200 p-6 rounded-[1.5rem] flex flex-col items-center justify-center text-center hover:border-primary hover:bg-primary/5 hover:shadow-md transition-all group h-40">
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
                    <textarea class="w-full border-none focus:ring-0 p-0 text-sm text-gray-700 resize-none h-16 outline-none bg-transparent placeholder-gray-400" placeholder="Örn: Çikolatalı, hafif bir tatlı..."></textarea>
                </div>
            `;
        }
    };

    const btnScan = document.getElementById('btn-scan');
    btnScan.addEventListener('click', () => {
        showScreen('loading');
        
        // Mock API call / AI Analysis Delay (2 seconds)
        setTimeout(() => {
            generateMockResults();
            showScreen('results');
        }, 2000);
    });

    // ==========================================
    // Screen 5: Results Logic
    // ==========================================
    const btnBackHome = document.getElementById('btn-back-home');
    btnBackHome.addEventListener('click', () => showScreen('dashboard'));

    const generateMockResults = () => {
        const prefContext = document.getElementById('pref-context');
        const container = document.getElementById('results-container');
        
        container.innerHTML = '';
        prefContext.innerHTML = '';

        // Context message based on preferences
        if (state.preferences.length > 0) {
            prefContext.innerHTML = `
                <div class="mb-4 text-xs font-medium bg-emerald-50 text-emerald-800 px-4 py-3 rounded-xl border border-emerald-100 flex items-center gap-3">
                    <div class="bg-white p-1 rounded-full shadow-sm">
                        <svg class="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <span><strong>${state.preferences.join(', ')}</strong> kriterlerinize göre analiz edildi.</span>
                </div>
            `;
        }

        let itemsHTML = '';
        
        // Mock data logic based on category
        if (state.currentCategory === 'Alışveriş') {
            itemsHTML = `
                <!-- RED CARD -->
                <div class="bg-white rounded-[1.5rem] p-5 border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div class="absolute left-0 top-0 bottom-0 w-2 bg-danger"></div>
                    <div class="flex justify-between items-start ml-2">
                        <div>
                            <h3 class="font-bold text-gray-800 text-lg mb-1">Tehlikeli Ürün İçeriği</h3>
                            <p class="text-sm text-gray-500 leading-snug">Bu üründe diyetinize uymayan bileşenler bulundu.</p>
                        </div>
                        <span class="bg-red-50 text-danger text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-red-100 whitespace-nowrap">
                            <span class="w-2 h-2 rounded-full bg-danger animate-pulse"></span> Riskli
                        </span>
                    </div>
                    <div class="mt-4 p-3 bg-red-50 rounded-xl text-sm text-red-800 ml-2 border border-red-100">
                        <span class="font-bold">Tespit Edilenler:</span> Süt tozu, Buğday Unu (Eser miktarda)
                    </div>
                </div>

                <!-- YELLOW CARD -->
                <div class="bg-white rounded-[1.5rem] p-5 border border-gray-100 shadow-sm relative overflow-hidden">
                    <div class="absolute left-0 top-0 bottom-0 w-2 bg-warning"></div>
                    <div class="flex justify-between items-start ml-2">
                        <div>
                            <h3 class="font-bold text-gray-800 text-lg mb-1">Dikkat Edilmesi Gereken</h3>
                            <p class="text-sm text-gray-500 leading-snug">Eser miktarda alerjen uyarısı mevcut.</p>
                        </div>
                        <span class="bg-amber-50 text-amber-600 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-amber-100 whitespace-nowrap">
                            <span class="w-2 h-2 rounded-full bg-warning"></span> Dikkat
                        </span>
                    </div>
                    <div class="mt-4 p-3 bg-amber-50 rounded-xl text-sm text-amber-800 ml-2 border border-amber-100">
                        <span class="font-bold">Uyarı:</span> Aynı hatta üretilmiş olabilir.
                    </div>
                </div>

                <!-- GREEN CARD -->
                <div class="bg-white rounded-[1.5rem] p-5 border border-gray-100 shadow-sm relative overflow-hidden">
                    <div class="absolute left-0 top-0 bottom-0 w-2 bg-safe"></div>
                    <div class="flex justify-between items-center ml-2">
                        <div>
                            <h3 class="font-bold text-gray-800 text-lg mb-1">Güvenli Alternatif</h3>
                            <p class="text-sm text-gray-500">Profilinize tamamen uygun.</p>
                        </div>
                        <span class="bg-green-50 text-safe text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-green-100 whitespace-nowrap">
                            <span class="w-2 h-2 rounded-full bg-safe"></span> Güvenli
                        </span>
                    </div>
                </div>
            `;
        } else {
            // Menu items for Cafe or Restoran
            itemsHTML = `
                <!-- GREEN CARD -->
                <div class="bg-white rounded-[1.5rem] p-5 border border-primary/20 shadow-md relative overflow-hidden">
                    <div class="absolute -right-6 -top-6 text-green-100 opacity-40 text-7xl select-none">✨</div>
                    <div class="absolute left-0 top-0 bottom-0 w-2 bg-safe"></div>
                    
                    <div class="flex justify-between items-start ml-2 relative z-10">
                        <div class="pr-3">
                            <h3 class="font-bold text-gray-800 text-xl mb-1">Meyveli Yulaf Kasesi</h3>
                            <p class="text-sm text-gray-600 font-medium">Tamamen size uygun ve hafif bir tercih.</p>
                            <p class="text-xs text-gray-400 mt-3 leading-relaxed bg-gray-50 p-2 rounded-lg inline-block border border-gray-100">
                                🥣 Yulaf, Badem Sütü, Orman Meyveleri, Chia Tohumu
                            </p>
                        </div>
                        <span class="bg-green-50 text-safe text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-green-200 shadow-sm whitespace-nowrap shrink-0">
                            <span class="w-2 h-2 rounded-full bg-safe animate-pulse"></span> Tam Eşleşme
                        </span>
                    </div>
                </div>

                <!-- YELLOW CARD -->
                <div class="bg-white rounded-[1.5rem] p-5 border border-gray-100 shadow-sm relative overflow-hidden mt-6">
                    <div class="absolute left-0 top-0 bottom-0 w-2 bg-warning"></div>
                    <div class="flex justify-between items-start ml-2">
                        <div class="pr-3">
                            <h3 class="font-bold text-gray-800 text-lg mb-1">Avokadolu Tost</h3>
                            <p class="text-sm text-gray-500">Ekmek tercihinize dikkat edin.</p>
                        </div>
                        <span class="bg-amber-50 text-amber-600 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-amber-100 whitespace-nowrap shrink-0">
                            <span class="w-2 h-2 rounded-full bg-warning"></span> Sorarak Alın
                        </span>
                    </div>
                    <div class="mt-4 p-3 bg-amber-50 rounded-xl text-sm text-amber-800 ml-2 border border-amber-100 flex gap-2">
                        <span class="text-lg">⚠️</span>
                        <div>Ekmeğin glutensiz olup olmadığını sipariş vermeden önce garsona onaylatın.</div>
                    </div>
                </div>

                <!-- RED CARD -->
                <div class="bg-white rounded-[1.5rem] p-5 border border-gray-100 shadow-sm relative overflow-hidden opacity-75 mt-6">
                    <div class="absolute left-0 top-0 bottom-0 w-2 bg-danger"></div>
                    <div class="flex justify-between items-start ml-2">
                        <div class="pr-3">
                            <h3 class="font-bold text-gray-800 text-lg mb-1 line-through decoration-2 decoration-danger/50">Kremalı Makarna</h3>
                            <p class="text-sm text-gray-500">Profilinize kesinlikle uymuyor.</p>
                        </div>
                        <span class="bg-red-50 text-danger text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-red-100 whitespace-nowrap shrink-0">
                            <span class="w-2 h-2 rounded-full bg-danger"></span> Uzak Durun
                        </span>
                    </div>
                </div>
            `;
        }

        container.innerHTML = itemsHTML;
    };
});
