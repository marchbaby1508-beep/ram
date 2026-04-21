// ========================= CURRENCY CONVERTER APP ========================= //

// Supported currencies with flags
const CURRENCIES = {
    'USD': { name: 'US Dollar', flag: '🇺🇸' },
    'EUR': { name: 'Euro', flag: '🇪🇺' },
    'GBP': { name: 'British Pound', flag: '🇬🇧' },
    'INR': { name: 'Indian Rupee', flag: '🇮🇳' },
    'JPY': { name: 'Japanese Yen', flag: '🇯🇵' },
    'AUD': { name: 'Australian Dollar', flag: '🇦🇺' },
    'CAD': { name: 'Canadian Dollar', flag: '🇨🇦' },
    'CHF': { name: 'Swiss Franc', flag: '🇨🇭' },
    'CNY': { name: 'Chinese Yuan', flag: '🇨🇳' },
    'SEK': { name: 'Swedish Krona', flag: '🇸🇪' },
    'NZD': { name: 'New Zealand Dollar', flag: '🇳🇿' },
    'MXN': { name: 'Mexican Peso', flag: '🇲🇽' },
    'SGD': { name: 'Singapore Dollar', flag: '🇸🇬' },
    'HKD': { name: 'Hong Kong Dollar', flag: '🇭🇰' },
    'NOK': { name: 'Norwegian Krone', flag: '🇳🇴' },
    'KRW': { name: 'South Korean Won', flag: '🇰🇷' },
    'TRY': { name: 'Turkish Lira', flag: '🇹🇷' },
    'RUB': { name: 'Russian Ruble', flag: '🇷🇺' },
    'BRL': { name: 'Brazilian Real', flag: '🇧🇷' },
    'ZAR': { name: 'South African Rand', flag: '🇿🇦' },
    'NPL': { name: 'Nepalese Rupee', flag: '🇳🇵' }
};

// Mock exchange rates (for demonstration)
const MOCK_RATES = {
    'USD': 1.0,
    'EUR': 0.92,
    'GBP': 0.79,
    'INR': 83.12,
    'JPY': 150.50,
    'AUD': 1.52,
    'CAD': 1.36,
    'CHF': 0.88,
    'CNY': 7.24,
    'SEK': 10.50,
    'NZD': 1.64,
    'MXN': 17.05,
    'SGD': 1.35,
    'HKD': 7.81,
    'NOK': 10.42,
    'KRW': 1319.50,
    'TRY': 32.50,
    'RUB': 97.50,
    'BRL': 4.97,
    'ZAR': 18.47
};

// Application state
let appState = {
    rates: {},
    favorites: JSON.parse(localStorage.getItem('favorites')) || ['USD', 'EUR', 'GBP', 'INR'],
    history: JSON.parse(localStorage.getItem('history')) || [],
    lastUpdate: null,
    isOnline: navigator.onLine
};

// Check online status
window.addEventListener('online', () => {
    appState.isOnline = true;
    const badge = document.getElementById('offlineBadge');
    if (badge) badge.style.display = 'none';
    updateExchangeRates();
});

window.addEventListener('offline', () => {
    appState.isOnline = false;
    const badge = document.getElementById('offlineBadge');
    if (badge) badge.style.display = 'block';
});

// ========================= THEME TOGGLE ========================= //
function initTheme() {
    const darkModeCheckbox = document.getElementById('darkModeCheckbox');
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const isDarkMode = savedTheme ? savedTheme === 'dark' : prefersDark;
    
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
        if (darkModeCheckbox) darkModeCheckbox.checked = true;
    } else {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
        if (darkModeCheckbox) darkModeCheckbox.checked = false;
    }
    
    if (darkModeCheckbox) {
        darkModeCheckbox.addEventListener('change', toggleTheme);
    }
}

function toggleTheme(e) {
    const isDark = e.target.checked;
    
    if (isDark) {
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
        localStorage.setItem('theme', 'light');
    }
}

// ========================= POPULATE CURRENCY SELECTS ========================= //
function populateCurrencySelects() {
    const fromSelect = document.getElementById('fromCurrency');
    const toSelect = document.getElementById('toCurrency');
    const multiFromSelect = document.getElementById('multiFromCurrency');
    
    const currencyOptions = Object.keys(CURRENCIES)
        .sort()
        .map(code => `<option value="${code}">${CURRENCIES[code].flag} ${code} - ${CURRENCIES[code].name}</option>`)
        .join('');
    
    if (fromSelect) fromSelect.innerHTML = currencyOptions;
    if (toSelect) toSelect.innerHTML = currencyOptions;
    if (multiFromSelect) multiFromSelect.innerHTML = currencyOptions;
    
    // Set defaults
    if (fromSelect) fromSelect.value = 'USD';
    if (toSelect) toSelect.value = 'EUR';
    if (multiFromSelect) multiFromSelect.value = 'USD';
}

// ========================= EXCHANGE RATES ========================= //
async function updateExchangeRates() {
    try {
        // In production, use a real API like exchangerate-api.com or X-Rates
        // For now, using mock data with slight random variations for demo
        const rates = {};
        Object.keys(MOCK_RATES).forEach(code => {
            rates[code] = MOCK_RATES[code] * (0.98 + Math.random() * 0.04);
        });
        
        appState.rates = rates;
        appState.lastUpdate = new Date();
        localStorage.setItem('rates', JSON.stringify(appState.rates));
        localStorage.setItem('ratesTimestamp', appState.lastUpdate);
        
        updateRateDisplay();
        performConversion();
        updateAnalytics();
    } catch (error) {
        console.error('Error updating rates:', error);
        // Load cached rates if available
        const cachedRates = JSON.parse(localStorage.getItem('rates'));
        if (cachedRates) {
            appState.rates = cachedRates;
        }
    }
}

function updateRateDisplay() {
    const rateDisplay = document.getElementById('rateDisplay');
    const timestamp = document.getElementById('rateTimestamp');
    
    if (rateDisplay && appState.rates) {
        const from = document.getElementById('fromCurrency')?.value || 'USD';
        const to = document.getElementById('toCurrency')?.value || 'EUR';
        
        if (appState.rates[to] && appState.rates[from]) {
            const rate = (appState.rates[to] / appState.rates[from]).toFixed(6);
            rateDisplay.textContent = `1 ${from} = ${rate} ${to}`;
        }
    }
    
    if (timestamp && appState.lastUpdate) {
        timestamp.textContent = `Updated: ${appState.lastUpdate.toLocaleTimeString()}`;
    }
}

// ========================= CURRENCY CONVERSION ========================= //
function performConversion() {
    const amount = parseFloat(document.getElementById('amount')?.value) || 0;
    const from = document.getElementById('fromCurrency')?.value || 'USD';
    const to = document.getElementById('toCurrency')?.value || 'EUR';
    
    if (!appState.rates[from] || !appState.rates[to]) return;
    
    const convertedAmount = (amount * (appState.rates[to] / appState.rates[from])).toFixed(2);
    
    const outputElement = document.getElementById('outputAmount');
    if (outputElement) {
        animateNumberChange(outputElement, convertedAmount);
    }
    
    // Update displays
    document.getElementById('inputAmountDisplay').textContent = amount.toFixed(2);
    document.getElementById('inputCurrencyDisplay').textContent = from;
    document.getElementById('outputCurrencyDisplay').textContent = to;
    document.getElementById('fromFlag').textContent = CURRENCIES[from]?.flag || '';
    document.getElementById('toFlag').textContent = CURRENCIES[to]?.flag || '';
    
    // Update rate
    updateRateDisplay();
    
    // Add to history (debounced)
    if (window.conversionTimeout) clearTimeout(window.conversionTimeout);
    window.conversionTimeout = setTimeout(() => {
        addToHistory(amount, from, convertedAmount, to);
    }, 1000);
}

function animateNumberChange(element, targetValue) {
    const startValue = parseFloat(element.textContent) || 0;
    const duration = 400;
    const startTime = Date.now();
    
    const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const currentValue = startValue + (targetValue - startValue) * progress;
        element.textContent = currentValue.toFixed(2);
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    };
    
    animate();
}

// ========================= SWAP CURRENCIES ========================= //
function swapCurrencies() {
    const fromSelect = document.getElementById('fromCurrency');
    const toSelect = document.getElementById('toCurrency');
    
    const temp = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = temp;
    
    // Add rotation animation
    const swapBtn = document.getElementById('swapButton');
    swapBtn.style.transform = 'rotate(180deg)';
    setTimeout(() => {
        swapBtn.style.transform = 'rotate(0deg)';
    }, 300);
    
    performConversion();
}

// ========================= FAVORITES ========================= //
function toggleFavorite() {
    const from = document.getElementById('fromCurrency').value;
    const to = document.getElementById('toCurrency').value;
    const pair = `${from}-${to}`;
    
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const index = favorites.indexOf(pair);
    
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(pair);
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoritesDisplay();
    
    // Animate button
    const btn = document.getElementById('favoriteBtn');
    btn.classList.add('clicked');
    setTimeout(() => btn.classList.remove('clicked'), 300);
}

function updateFavoritesDisplay() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const favoritesList = document.getElementById('favoritesList');
    
    if (!favoritesList) return;
    
    if (favorites.length === 0) {
        favoritesList.innerHTML = '<p class="empty-state">No favorites yet. Add some!</p>';
        return;
    }
    
    favoritesList.innerHTML = favorites.map(pair => {
        const [from, to] = pair.split('-');
        return `
            <div class="favorite-item" onclick="quickConvert('${from}', '${to}')">
                <span>${CURRENCIES[from]?.flag} ${from}</span>
                <span style="margin: 0 8px;">→</span>
                <span>${CURRENCIES[to]?.flag} ${to}</span>
            </div>
        `;
    }).join('');
}

function quickConvert(from, to) {
    document.getElementById('fromCurrency').value = from;
    document.getElementById('toCurrency').value = to;
    performConversion();
}

// ========================= CONVERSION HISTORY ========================= //
function addToHistory(amount, from, result, to) {
    const history = JSON.parse(localStorage.getItem('history')) || [];
    
    history.push({
        amount: parseFloat(amount),
        from,
        result: parseFloat(result),
        to,
        timestamp: new Date().toISOString()
    });
    
    // Keep only last 50 conversions
    if (history.length > 50) {
        history.shift();
    }
    
    localStorage.setItem('history', JSON.stringify(history));
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    const history = JSON.parse(localStorage.getItem('history')) || [];
    const historyList = document.getElementById('historyList');
    
    if (!historyList) return;
    
    if (history.length === 0) {
        historyList.innerHTML = '<p class="empty-state">No conversion history yet</p>';
        return;
    }
    
    historyList.innerHTML = history.slice(-10).reverse().map((item, idx) => `
        <div class="history-item">
            <strong>${item.amount.toFixed(2)} ${item.from}</strong> → 
            <strong>${item.result.toFixed(2)} ${item.to}</strong>
            <small>${new Date(item.timestamp).toLocaleDateString()} ${new Date(item.timestamp).toLocaleTimeString()}</small>
        </div>
    `).join('');
}

// ========================= MULTI-CURRENCY CONVERSION ========================= //
function toggleMultiView() {
    const container = document.getElementById('multiContainer');
    container.style.display = container.style.display === 'none' ? 'block' : 'none';
}

function updateMultiCurrency() {
    const amount = parseFloat(document.getElementById('multiAmount')?.value) || 0;
    const from = document.getElementById('multiFromCurrency')?.value || 'USD';
    const resultsContainer = document.getElementById('multiResults');
    
    if (!appState.rates[from] || !resultsContainer) return;
    
    const results = [];
    Object.entries(CURRENCIES).forEach(([code, info]) => {
        if (code !== from && appState.rates[code]) {
            const converted = (amount * (appState.rates[code] / appState.rates[from])).toFixed(2);
            results.push({
                code,
                converted,
                flag: info.flag
            });
        }
    });
    
    resultsContainer.innerHTML = results.map(item => `
        <div class="multi-result-item" style="background: var(--card); border: 1px solid var(--border); padding: 12px; border-radius: 8px; text-align: center;">
            <div>${item.flag} ${item.code}</div>
            <div class="amount" style="font-size: 18px; font-weight: 700; color: var(--cyan); margin-top: 4px;">${item.converted}</div>
        </div>
    `).join('');
}

// ========================= ACTION BUTTONS ========================= //
function copyResult() {
    const result = document.getElementById('outputAmount').textContent;
    const currency = document.getElementById('outputCurrencyDisplay').textContent;
    const text = `${result} ${currency}`;
    
    navigator.clipboard.writeText(text).then(() => {
        showNotification('✓ Copied to clipboard!');
        const btn = document.getElementById('copyBtn');
        btn.innerHTML = '<i class="fas fa-check"></i> Copied';
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-copy"></i> Copy';
        }, 2000);
    });
}

function shareResult() {
    const amount = document.getElementById('amount').value;
    const from = document.getElementById('fromCurrency').value;
    const result = document.getElementById('outputAmount').textContent;
    const to = document.getElementById('outputCurrencyDisplay').textContent;
    
    const text = `I just converted ${amount} ${from} to ${result} ${to} using WeConvert!`;
    
    if (navigator.share) {
        navigator.share({
            title: 'WeConvert - Currency Converter',
            text: text,
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(text);
        showNotification('✓ Share text copied to clipboard!');
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #00d4ff, #0099cc);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        font-weight: 600;
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// ========================= ANALYTICS ========================= //
function updateAnalytics() {
    updateTrendChart();
    updateCurrencyStrength();
    updateBestTimeIndicator();
}

function updateTrendChart() {
    const canvas = document.getElementById('trendChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const isDark = document.body.classList.contains('dark-mode');
    
    // Clear canvas
    ctx.fillStyle = isDark ? '#1a1f3a' : '#f5f5f5';
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid
    ctx.strokeStyle = isDark ? '#2a2f4a' : '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
        const y = (height / 10) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
    
    // Draw simple price chart
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 2;
    
    const days = 7;
    const points = [];
    for (let i = 0; i < days; i++) {
        const x = (i / (days - 1)) * (width - 40) + 20;
        const y = height - (Math.random() * 60 + 40);
        points.push({ x, y });
    }
    
    ctx.beginPath();
    points.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();
    
    // Draw points
    ctx.fillStyle = '#ff00ff';
    points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
        ctx.fill();
    });
}

function updateCurrencyStrength() {
    const strengthList = document.getElementById('strengthList');
    if (!strengthList) return;
    
    const mainCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CHF'];
    
    strengthList.innerHTML = mainCurrencies.map(code => {
        const strength = Math.floor(Math.random() * 40 + 60);
        return `
            <div class="strength-item">
                <span class="strength-name">${CURRENCIES[code]?.flag} ${code}</span>
                <div class="strength-bar">
                    <div class="strength-fill" style="width: ${strength}%"></div>
                </div>
                <span class="strength-value">${strength}%</span>
            </div>
        `;
    }).join('');
}

function updateBestTimeIndicator() {
    const indicator = document.getElementById('bestTimeInfo');
    if (!indicator) return;
    
    const isGood = Math.random() > 0.5;
    indicator.innerHTML = `
        <div class="badge ${isGood ? 'badge-good' : 'badge-warning'}">
            ${isGood ? '🟢 Good Rate' : '🟡 Average Rate'}
        </div>
        <p>Last updated: <span id="bestTimeUpdate">${new Date().toLocaleTimeString()}</span></p>
    `;
}

// ========================= PARTICLE ANIMATION ========================= //
function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = 50;
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2;
            this.speedX = (Math.random() - 0.5) * 1;
            this.speedY = (Math.random() - 0.5) * 1;
            this.opacity = Math.random() * 0.5 + 0.3;
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
        }
        
        draw(ctx) {
            ctx.fillStyle = `rgba(0, 212, 255, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    const ctx = canvas.getContext('2d');
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw(ctx);
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// ========================= EVENT LISTENERS ========================= //
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    populateCurrencySelects();
    updateExchangeRates();
    updateFavoritesDisplay();
    updateHistoryDisplay();
    initParticles();
    updateAnalytics();
    
    // Conversion listeners
    document.getElementById('amount')?.addEventListener('input', performConversion);
    document.getElementById('fromCurrency')?.addEventListener('change', performConversion);
    document.getElementById('toCurrency')?.addEventListener('change', performConversion);
    
    // Multi-currency listeners
    document.getElementById('multiAmount')?.addEventListener('input', updateMultiCurrency);
    document.getElementById('multiFromCurrency')?.addEventListener('change', updateMultiCurrency);
    
    // Button listeners
    document.getElementById('swapButton')?.addEventListener('click', swapCurrencies);
    document.getElementById('favoriteBtn')?.addEventListener('click', toggleFavorite);
    document.getElementById('copyBtn')?.addEventListener('click', copyResult);
    document.getElementById('shareBtn')?.addEventListener('click', shareResult);
    document.getElementById('toggleMulti')?.addEventListener('click', toggleMultiView);
    
    // Update rates every 60 seconds
    setInterval(updateExchangeRates, 60000);
});

// ========================= CONSOLE MESSAGE ========================= //
console.log('%c💱 WeConvert - Smart Currency Converter', 'color: #00d4ff; font-size: 16px; font-weight: bold;');
console.log('%cReal-time exchange rates • Offline mode • Advanced analytics', 'color: #00d4ff;');
