
// Use the scraped data
const countries = [
    { "text": "Thailand", "value": "194::Thailand", "iso": "TH" },
    { "text": "United States", "value": "210::United States of America", "iso": "US" },
    { "text": "Japan", "value": "100::Japan", "iso": "JP" },
    { "text": "China", "value": "43::China", "iso": "CN" },
    { "text": "United Kingdom", "value": "69::Great Britain", "iso": "GB" },
    { "text": "Germany", "value": "72::Germany", "iso": "DE" },
    { "text": "Australia", "value": "14::Australia", "iso": "AU" },
    // Add major ones for demo, or load dynamic
    { "text": "France", "value": "259::France", "iso": "FR" },
    { "text": "South Korea", "value": "106::Korea (Rep.)", "iso": "KR" },
    { "text": "Singapore", "value": "179::Singapore", "iso": "SG" },
    // ... (Full list can be added here or fetched)
];

// App State
let currentTab = 'domestic';
let currentLang = localStorage.getItem('thp_lang') || 'th'; // Load Saved or Default

function changeLanguage(lang) {
    currentLang = lang;
    // localStorage.setItem('thp_lang', lang); // Removed: Only save when set via Settings
    updatePageLanguage();

    // Update language switcher UI
    document.querySelectorAll('.lang-option').forEach(opt => {
        if (opt.dataset.lang === lang) opt.classList.add('active');
        else opt.classList.remove('active');
    });

    // Sync Iframe Language
    const iframe = document.querySelector('iframe');
    if (iframe) {
        // Check if current src matches desired lang to avoid reload loop
        const currentSrc = iframe.getAttribute('src');
        let newSrc = 'https://international.thailandpost.com/find-rates/';

        if (lang === 'en') {
            newSrc += '?lang=en';
        }

        if (currentSrc !== newSrc) {
            // Show loading overlay
            const loader = document.getElementById('interLoading');
            if (loader) loader.style.display = 'flex';

            iframe.setAttribute('src', newSrc);
        }
    }

    // Re-render results if already calculated
    const weight = document.getElementById('weight').value;
    const resultsArea = document.getElementById('resultsArea');
    if (weight && resultsArea && resultsArea.classList.contains('show')) {
        // Re-trigger calculation to refresh results text
        const fakeEvent = { preventDefault: () => { } };
        calculateRate(fakeEvent);
    }

    // Refresh Jumbo Results if active
    const jumboResult = document.getElementById('resultCard');
    if (jumboResult && jumboResult.style.display === 'block') {
        calculateJumbo();
    }

    // Refresh Province Dropdowns (preserve selection is handled in initJumboData)
    if (typeof initJumboData === 'function') {
        initJumboData();
    }
}

function checkEnter(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        calculateRate(event);
    }
}

function t(key) {
    if (typeof translations === 'undefined' || !translations[currentLang]) return key;
    return translations[currentLang][key] || key;
}

function updatePageLanguage() {
    if (typeof translations === 'undefined') return;

    // 1. Text Content
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang][key]) {
            el.innerHTML = translations[currentLang][key];
        }
    });

    // 2. Placeholders
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        const key = el.getAttribute('data-i18n-ph');
        if (translations[currentLang][key]) {
            el.setAttribute('placeholder', translations[currentLang][key]);
        }
    });
}

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Language
    // Force call changeLanguage to sync UI (header pills) and Logic
    changeLanguage(currentLang);

    // Initialize Data
    if (typeof init === 'function') init();
    if (typeof initJumbo === 'function') initJumbo();

    // Set active tab UI
    const savedTab = localStorage.getItem('lastActiveTab') || 'domestic';
    if (typeof switchTab === 'function') switchTab(savedTab);
});


// Fallback Data (For when API is slow/offline)
const defaultRates = {
    domestic: [
        { name_service: "EMS", total_price: 67.00, max_weight_range: "1000g" },
        { name_service: "eCo-Post", total_price: 40.00, max_weight_range: "1000g" },
        { name_service: "Registered (Box)", total_price: 60.00, max_weight_range: "1000g" },
        { name_service: "Registered (Envelope)", total_price: 53.00, max_weight_range: "1000g" },
        { name_service: "Parcel Post", total_price: 20.00, max_weight_range: "1000g" },
        { name_service: "Letter", total_price: 40.00, max_weight_range: "1000g" },
        { name_service: "Printed Matter", total_price: 17.00, max_weight_range: "1000g" }
    ],
    international: [
        { name_service: "Courier Post", total_price: 1450.00, max_weight_range: "1000g" },
        { name_service: "EMS World", total_price: 1100.00, max_weight_range: "1000g" },
        { name_service: "ePacket", total_price: 850.00, max_weight_range: "1000g" },
        { name_service: "Air Mail", total_price: 650.00, max_weight_range: "1000g" }
    ]
};

function getFallbackRates() {
    try {
        const stored = localStorage.getItem('thp_rates');
        if (stored) {
            const parsed = JSON.parse(stored);
            // Validate structure
            if (parsed && Array.isArray(parsed.domestic) && Array.isArray(parsed.international)) {
                return parsed;
            }
        }
    } catch (e) {
        console.warn("Error reading rates from localStorage, using defaults:", e);
    }
    return defaultRates;
}

function init() {
    const select = document.getElementById('country');
    if (!select) return;

    // Sort countries alphabetically
    countries.sort((a, b) => a.text.localeCompare(b.text));

    countries.forEach(c => {
        // Skip Thailand in international list (optional)
        if (c.text === 'Thailand') return;

        const opt = document.createElement('option');
        opt.value = c.value;
        opt.textContent = c.text;
        select.appendChild(opt);
    });
}

function switchTab(tab) {
    currentTab = tab;
    localStorage.setItem('lastActiveTab', tab);

    // UI Updates
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`[data-tab="${tab}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    const domesticContent = document.getElementById('domesticContent');
    const jumboContent = document.getElementById('jumboContent');
    const interLinkGroup = document.getElementById('interLinkGroup');

    // Reset all
    if (domesticContent) domesticContent.style.display = 'none';
    if (jumboContent) jumboContent.style.display = 'none';
    if (interLinkGroup) {
        interLinkGroup.style.visibility = 'hidden';
        interLinkGroup.style.position = 'absolute';
    }

    if (tab === 'international') {
        if (interLinkGroup) {
            interLinkGroup.style.visibility = 'visible';
            interLinkGroup.style.position = 'relative';
            interLinkGroup.style.left = '0';
        }
    } else if (tab === 'jumbo') {
        if (jumboContent) jumboContent.style.display = 'block';
    } else {
        // domestic
        if (domesticContent) domesticContent.style.display = 'block';
    }

    // Clear results
    const resultsArea = document.getElementById('resultsArea');
    if (resultsArea) resultsArea.classList.remove('show');
}

// Debug Logger
function log(msg) {
    // const d = document.getElementById('debugLog');
    // if (d) {
    //     d.style.display = 'block';
    //     const line = document.createElement('div');
    //     line.innerHTML = `[${new Date().toLocaleTimeString()}] ${msg}`;
    //     line.style.borderBottom = '1px solid #333';
    //     d.appendChild(line);
    //     d.scrollTop = d.scrollHeight;
    // }
    console.log(msg);
}

// Debounce Utility
function debounce(func, timeout = 700) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

// Auto-Calc Setup (Called on Init)
function setupAutoCalc() {
    const debouncedCalc = debounce(() => calculateRate(null, true));

    // Weight
    const weightEl = document.getElementById('weight');
    if (weightEl) weightEl.addEventListener('input', debouncedCalc);

    // Zip Inputs (Attached dynamically or safely checked here)
    const originEl = document.getElementById('originZip');
    if (originEl) originEl.addEventListener('input', debouncedCalc);

    const destEl = document.getElementById('destZip');
    if (destEl) destEl.addEventListener('input', debouncedCalc);

    // Checkboxes (Immediate)
    const toggles = ['use2026Rates', 'isOriginRemote', 'isDestRemote'];
    toggles.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', () => calculateRate(null, true));
    });
}

// Call setup on DOM load
document.addEventListener('DOMContentLoaded', setupAutoCalc);


async function calculateRate(e, isAuto = false) {
    if (e && e.preventDefault) e.preventDefault();

    // log("Calculation started...");

    const weightInput = document.getElementById('weight');
    const weight = weightInput ? parseFloat(weightInput.value) : 0;

    // Auto-Mode: If weight invalid, just clear results and return silently
    if (!weight || weight <= 0) {
        if (!isAuto) alert("Please enter valid weight (กรุณากรอกน้ำหนัก)");
        // Clear results if invalid
        document.getElementById('resultsArea').classList.remove('show');
        return;
    }

    // log(`Input Weight: ${weight}`);

    const loader = document.getElementById('loader');
    const resultsArea = document.getElementById('resultsArea');
    const resultsList = document.getElementById('resultsList');

    // Show Loading only if manual (or subtle loading for auto? Keep subtle)
    // loader.classList.add('show'); 
    // Auto-calc feels faster without full loader flicker. Maybe just opacity?
    // Let's keep loader for now but maybe shorter delay.

    // Determine Country ID
    let countryId = '194::Thailand'; // Default Domestic
    if (currentTab === 'international') {
        const cVal = document.getElementById('country').value;
        if (cVal) countryId = cVal;
    }

    // Capture Zip for Remote Check
    const zipCode = document.getElementById('domZipcode') ? document.getElementById('domZipcode').value : "";
    const is2026 = document.getElementById('use2026Rates') && document.getElementById('use2026Rates').checked;

    try {
        // await new Promise(r => setTimeout(r, 600)); // Remove fake delay for auto-calc speed

        let rates = [];

        if (currentTab === 'domestic') {
            if (is2026) {
                // 2026 Logic
                const originZip = document.getElementById('originZip').value;
                const destZip = document.getElementById('destZip').value;

                // Auto-Mode Validation: Silent Fail if incomplete
                if (!originZip || !destZip || originZip.length < 5 || destZip.length < 5) {
                    if (!isAuto) alert("For 2026 Rates, please enter both Origin and Destination Zipcodes (5 digits).");
                    // Do not clear if just typing... actually clear results to avoid misleading old price
                    // resultsArea.classList.remove('show');
                    return;
                }

                // Get Confirmation State
                const originConfirmed = document.getElementById('isOriginRemote').checked;
                const destConfirmed = document.getElementById('isDestRemote').checked;

                const domesticResults = RateEngine.calculateDomestic2026(weight, originZip, destZip, originConfirmed, destConfirmed);
                rates = domesticResults.map(r => ({
                    name_service: r.name,
                    total_price: r.price,
                    remote_applied: r.remote_applied || false,
                    details: r.details
                }));
            } else {
                // Use local RateEngine
                if (typeof RateEngine === 'undefined') {
                    throw new Error("RateEngine not loaded");
                }
                const domesticResults = RateEngine.calculateAllDomestic(weight, zipCode);

                rates = domesticResults.map(r => ({
                    name_service: r.name,
                    total_price: r.price,
                    remote_applied: r.remote_applied || false,
                    details: r.details
                }));
            }

        } else {
            // International
            const fallbackRates = getFallbackRates();
            const mocks = fallbackRates.international;
            rates = mocks.map(m => {
                const multiplier = Math.max(1, weight / 1000);
                return {
                    ...m,
                    total_price: (m.total_price * multiplier).toFixed(2)
                };
            });
        }

        resultsList.innerHTML = ''; // Clear only before rendering new valid results
        renderResults(rates, true);

        // --- HISTORY AUTO-SAVE ---
        if (is2026 && rates.length > 0) {
            const ems = rates.find(r => r.name_service.toLowerCase().includes('ems'));
            const priceToShow = ems ? ems.total_price : rates[0].total_price;

            HistoryManager.add({
                weight: weight,
                origin: document.getElementById('originZip').value,
                dest: document.getElementById('destZip').value,
                isOriginRemote: document.getElementById('isOriginRemote').checked,
                isDestRemote: document.getElementById('isDestRemote').checked,
                price: priceToShow
            });
        }
    } catch (error) {
        console.error(error);
        if (!isAuto) alert("Error calculating rates. See logs.");
    } finally {
        // loader.classList.remove('show');
    }
}


function renderResults(rates, isEstimated) {
    const resultsArea = document.getElementById('resultsArea');
    const resultsList = document.getElementById('resultsList');

    // Header update if estimated
    const header = resultsArea.querySelector('h3');
    header.innerHTML = isEstimated
        ? t('estimatedRates') // Just "Estimated Rates", no error message
        : t('availableServices');

    if (!rates || rates.length === 0) {
        resultsList.innerHTML = `<div style="text-align:center; color: #666;">${t('noServicesFound')}</div>`;
        resultsArea.classList.add('show');
        return;
    }

    // Filter out null or invalid entries if any
    const validRates = rates.filter(r => r.total_price && parseFloat(r.total_price) > 0);

    validRates.forEach(rate => {
        const card = document.createElement('div');
        card.className = 'result-card';
        card.setAttribute('data-base-price', rate.total_price); // Store base price

        const rawPrice = parseFloat(rate.total_price);
        // Format price
        const price = rawPrice.toLocaleString('th-TH', {
            style: 'currency',
            currency: 'THB'
        });

        // Determine Service Name & Icon
        let lowerName = rate.name_service.toLowerCase();
        let displayName = rate.name_service;
        let addOnBadge = '';
        let optionsHtml = '';

        // Remote Area Indicator (Domestic)
        // Remote Area Indicator (Domestic)
        if (rate.remote_applied) {
            let remarkText = "";
            const zipVal = document.getElementById('domZipcode') ? document.getElementById('domZipcode').value.trim() : "";
            if (typeof domesticRemoteRemarks !== 'undefined' && domesticRemoteRemarks[zipVal]) {
                remarkText = ` <span style="font-size:0.8em; color:#d32f2f;">(${domesticRemoteRemarks[zipVal]})</span>`;
            }
            displayName += ` <span style="font-size:0.75em; color:var(--primary); background:#ffebee; padding:2px 6px; border-radius:4px; border:1px solid #ffcdd2;">${currentLang === 'th' ? 'พื้นที่ห่างไกล' : 'Remote Area'}</span>${remarkText}`;
        }

        // --- Translation & Customization Logic ---
        // Map API service names to Translation Keys
        if (lowerName.includes('ems')) {
            displayName = t('serviceEMS');
        } else if (lowerName.includes('eco-post')) {
            displayName = t('serviceEco');
        } else if (lowerName.includes('registered')) {
            displayName = t('serviceReg');
        } else if (lowerName.includes('parcel post')) {
            displayName = t('serviceParcel');
        } else if (lowerName.includes('letter')) {
            displayName = t('serviceLetter');
        } else if (lowerName.includes('printed')) {
            displayName = t('servicePrinted');
            // Check weight for Books condition
            const weightVal = parseFloat(document.getElementById('weight').value) || 0;
            if (weightVal > 2000 && weightVal <= 5000) {
                displayName = currentLang === 'en' ? "Printed Matter (Books)" : "ของตีพิมพ์ (หนังสือ)";
            }
        }

        // --- AR / Options Logic ---
        if (lowerName.includes('ems')) {
            // EMS: AR Checkbox (+12)
            optionsHtml = `
                <div style="margin-top: 5px; font-size: 0.9em; color: #555;">
                    <label style="cursor:pointer; display:flex; align-items:center;">
                        <input type="checkbox" class="ar-checkbox" value="12" style="margin-right:5px;" onchange="updateCardTotal(this)">
                        ${t('optAR')} +12&nbsp;บาท
                    </label>
                </div>
            `;

            // EMS Add-ons (Volumetric & Insurance)
            addOnBadge = `
                <span style="color: var(--secondary); font-size: 0.8em; margin-right: 5px; cursor: pointer; text-decoration: underline;" 
                    onclick="openDimModal()" 
                    title="Check Volumetric Weight">
                    EMS ขนาดใหญ่
                </span>
                <span style="color: #28a745; font-size: 1.1em; margin-left: 5px; cursor: pointer;" 
                    onclick="openInsuranceModal(${rawPrice})"
                    title="Add Insurance">
                    <i class="fa-solid fa-circle-plus"></i>
                </span>
             `;
        } else if (lowerName.includes('eco-post') || lowerName.includes('parcel post')) {
            // eCo-Post & Parcel: AR Checkbox (+3)
            optionsHtml = `
                <div style="margin-top: 5px; font-size: 0.9em; color: #555;">
                    <label style="cursor:pointer; display:flex; align-items:center;">
                        <input type="checkbox" class="ar-checkbox" value="3" style="margin-right:5px;" onchange="updateCardTotal(this)"> 
                        ใบตอบรับ (AR) +3&nbsp;บาท
                    </label>
                </div>
            `;
        } else if (lowerName.includes('registered')) {
            // Registered: Two Checkboxes (Mutually Exclusive)
            optionsHtml = `
                <div style="margin-top: 5px; font-size: 0.9em; color: #555;">
                    <div style="margin-bottom:2px;">
                        <label style="cursor:pointer; display:flex; align-items:center;">
                            <input type="checkbox" class="ar-checkbox registered-opt" value="3" style="margin-right:5px;" onchange="toggleRegisteredOption(this)"> 
                            ใบตอบรับ (AR) +3&nbsp;บาท
                        </label>
                    </div>
                    <div>
                        <label style="cursor:pointer; display:flex; align-items:center;">
                            <input type="checkbox" class="ar-checkbox registered-opt" value="8" style="margin-right:5px;" onchange="toggleRegisteredOption(this)"> 
                            AR Tracking +8&nbsp;บาท
                        </label>
                    </div>
                </div>
            `;
        }

        // --- Service Info Tooltip Data ---
        let infoTooltip = '';
        if (lowerName.includes('ems')) {
            infoTooltip = 'น้ำหนัก: 30kg<br>ขนาดปกติ: ก+ย+ส ≤ 120ซม. (ด้านยาว ≤ 60ซม.)<br>ขนาดใหญ่: ก+ย+ส ≤ 240ซม.';
        } else if (lowerName.includes('eco-post')) {
            infoTooltip = 'Max Weight: 10kg<br>Suitable for boxes<br>Trackable status';
        } else if (lowerName.includes('registered')) {
            if (lowerName.includes('box')) {
                infoTooltip = 'Max Weight: 2kg<br>Suitable for small items';
            } else {
                infoTooltip = 'Max Weight: 2kg<br>Dimensions: < 90cm (Sum)<br>Document/Paper only';
            }
        } else if (lowerName.includes('parcel post')) {
            infoTooltip = 'น้ำหนัก: 20kg<br>ขนาด: ด้านยาว ≤ 1,500มม.<br>ยาว+รอบรูป ≤ 3,000มม.<br>ต่ำสุด: 90x140 มม.';
        } else if (lowerName.includes('letter')) {
            infoTooltip = 'พิกัดน้ำหนัก: 2kg<br>แบบซอง: ก+ย+ส ไม่เกิน 600มม.<br>แบบหีบห่อ: ก+ย+ส เกิน 600มม.';
        } else if (lowerName.includes('printed')) {
            infoTooltip = 'น้ำหนัก: 2kg (หนังสือ 5kg)<br>ขนาด: ก+ย+ส ≤ 900มม. (ด้านยาว ≤ 600มม.)<br>ม้วน: ย+2ศก. ≤ 1,040มม. (ยาว ≤ 900มม.)<br>ต่ำสุด: 90x140 มม.';
        }

        let infoIconHtml = '';
        if (infoTooltip) {
            infoIconHtml = `
                <span class="info-icon">
                    <i class="fa-solid fa-circle-info"></i>
                    <span class="tooltip-text">${infoTooltip}</span>
                </span>
            `;
        }

        card.innerHTML = `
            <div class="service-info">
                <div class="service-name">
                    ${displayName}
                    ${infoIconHtml}
                </div>
                <!-- <div style="font-size: 0.85rem; color: #888;">Weight: ${rate.max_weight_range || ''}</div> -->
                ${optionsHtml}
            </div>
            <div style="display:flex; align-items:center;">
                <div class="service-price">${price}</div>
                ${addOnBadge}
            </div>
        `;

        resultsList.appendChild(card);
    });

    resultsArea.classList.add('show');
}

// Logic to enforce single selection for Registered options
function toggleRegisteredOption(element) {
    if (element.checked) {
        // Uncheck other checkboxes in the same container that have class 'registered-opt'
        const card = element.closest('.result-card');
        const others = card.querySelectorAll('.registered-opt');
        others.forEach(cb => {
            if (cb !== element) {
                cb.checked = false;
            }
        });
    }
    // Update total price
    updateCardTotal(element);
}

// Function to update price when options change
function updateCardTotal(element) {
    const card = element.closest('.result-card');
    const basePrice = parseFloat(card.getAttribute('data-base-price'));
    let addOnPrice = 0;

    // Check ALL Checkboxes (supports multiple)
    const checkboxes = card.querySelectorAll('.ar-checkbox');
    checkboxes.forEach(cb => {
        if (cb.checked) {
            addOnPrice += parseFloat(cb.value);
        }
    });

    // Check Select (Legacy/Fallback if needed, though replaced above)
    const select = card.querySelector('.ar-select');
    if (select) {
        addOnPrice += parseFloat(select.value);
    }

    const total = basePrice + addOnPrice;

    // Update Display
    const priceEl = card.querySelector('.service-price');
    priceEl.innerText = total.toLocaleString('th-TH', {
        style: 'currency',
        currency: 'THB'
    });

    // If EMS, update Insurance Button Base Price too
    const insuranceIcon = card.querySelector('.fa-circle-plus');
    if (insuranceIcon) {
        const insuranceBtn = insuranceIcon.parentElement;
        insuranceBtn.setAttribute('onclick', `openInsuranceModal(${total})`);
    }
}

// Helper to separate EMS logic
function getEMSRate(weightInt) {
    let price = 0;
    if (weightInt <= 20) price = 32;
    else if (weightInt <= 100) price = 37;
    else if (weightInt <= 250) price = 42;
    else if (weightInt <= 500) price = 52;
    else if (weightInt <= 1000) price = 67;
    else if (weightInt <= 1500) price = 82;
    else if (weightInt <= 2000) price = 97;
    else if (weightInt <= 2500) price = 100;
    else if (weightInt <= 3000) price = 105;
    else if (weightInt <= 3500) price = 110;
    else if (weightInt <= 4000) price = 120;
    else if (weightInt <= 4500) price = 120;
    else if (weightInt <= 5000) price = 120;
    else if (weightInt <= 5500) price = 130;
    else if (weightInt <= 6000) price = 140;
    else if (weightInt <= 6500) price = 150;
    else if (weightInt <= 7000) price = 160;
    else if (weightInt <= 7500) price = 170;
    else if (weightInt <= 8000) price = 180;
    else if (weightInt <= 8500) price = 190;
    else if (weightInt <= 9000) price = 200;
    else if (weightInt <= 9500) price = 210;
    else if (weightInt <= 10000) price = 220;
    else if (weightInt <= 11000) price = 230;
    else if (weightInt <= 12000) price = 240;
    else if (weightInt <= 13000) price = 250;
    else if (weightInt <= 14000) price = 260;
    else if (weightInt <= 15000) price = 270;
    else if (weightInt <= 16000) price = 280;
    else if (weightInt <= 17000) price = 290;
    else if (weightInt <= 18000) price = 300;
    else if (weightInt <= 19000) price = 310;
    else if (weightInt <= 20000) price = 320;
    else if (weightInt <= 21000) price = 330;
    else if (weightInt <= 22000) price = 340;
    else if (weightInt <= 23000) price = 350;
    else if (weightInt <= 24000) price = 360;
    else if (weightInt <= 25000) price = 380;
    else if (weightInt <= 26000) price = 400;
    else if (weightInt <= 27000) price = 420;
    else if (weightInt <= 28000) price = 440;
    else if (weightInt <= 29000) price = 460;
    else if (weightInt <= 30000) price = 480;
    else return null;
    return price;
}

// Global variable to store current actual weight for comparison
let currentActualWeight = 0;

// Insurance calculation logic
let currentBasePrice = 0;

function openInsuranceModal(basePrice) {
    const modal = document.getElementById('insuranceModal');
    modal.classList.add('show');
    currentBasePrice = basePrice;

    // Reset inputs
    document.getElementById('declaredValue').value = '';
    document.getElementById('insBasePrice').textContent = basePrice.toLocaleString() + ' ฿';
    document.getElementById('insFee').textContent = '0.00 ฿';
    document.getElementById('insTotal').textContent = basePrice.toLocaleString() + ' ฿';
}

function closeInsuranceModal() {
    document.getElementById('insuranceModal').classList.remove('show');
}

function calculateInsurance() {
    let val = parseFloat(document.getElementById('declaredValue').value);
    if (!val || val < 0) val = 0;

    // Cap at 50,000
    if (val > 50000) {
        val = 50000;
        document.getElementById('declaredValue').value = 50000;
    }

    let fee = 0;
    if (val > 0) {
        if (val <= 20000) {
            const units = Math.ceil(val / 500);
            fee = 15 + (units * 5);
        } else {
            const remaining = val - 20000;
            const extraUnits = Math.ceil(remaining / 500);
            fee = 15 + (40 * 5) + (extraUnits * 10);
        }
    }

    const total = currentBasePrice + fee;

    document.getElementById('insFee').textContent = fee.toLocaleString() + ' ฿';
    document.getElementById('insTotal').textContent = total.toLocaleString() + ' ฿';
}

// Dimension Logic
function openDimModal() {
    document.getElementById('dimModal').classList.add('show');
    document.getElementById('dimWidth').value = '';
    document.getElementById('dimLength').value = '';
    document.getElementById('dimHeight').value = '';
    document.getElementById('dimResult').style.display = 'none';

    // Read weight directly from input for robustness
    const wVal = parseFloat(document.getElementById('weight').value) || 0;
    currentActualWeight = wVal;
}

function closeDimModal() {
    document.getElementById('dimModal').classList.remove('show');
}

function calculateVolumetric() {
    const w = parseFloat(document.getElementById('dimWidth').value);
    const l = parseFloat(document.getElementById('dimLength').value);
    const h = parseFloat(document.getElementById('dimHeight').value);

    // Validation
    let missing = [];
    if (!w) missing.push('Width');
    if (!l) missing.push('Length');
    if (!h) missing.push('Height');

    if (missing.length > 0) {
        alert('Please fill in all fields: ' + missing.join(', '));
        return;
    }

    const maxSide = Math.max(w, l, h);
    const sumDim = w + l + h;
    const resultBox = document.getElementById('dimResult');
    resultBox.style.display = 'block';

    if (sumDim > 240) {
        resultBox.innerHTML = `<div style="color:red; font-weight:bold;">Dimensions exceed 240cm limit! (EMS Max Sum)</div>`;
        return;
    }

    // Condition: 
    // Normal: Sum <= 120 AND MaxSide <= 60
    // Large: (Sum > 120 OR MaxSide > 60) AND Sum <= 240
    const isNormal = (sumDim <= 120 && maxSide <= 60);

    if (!isNormal) {
        // Calculate Volume Weight
        const volWeight = (w * l * h) / 6000;
        const volWeightGrams = Math.ceil(volWeight * 1000); // Convert kg to g

        let msg = `<div style="margin-bottom:10px;">Dimensions: ${w}x${l}x${h} cm (Sum: ${sumDim})</div>`;
        msg += `<div style="margin-bottom:10px;">Volumetric Weight: ${volWeight.toFixed(2)} kg (${volWeightGrams}g)</div>`;

        // Check Jumbo Limit
        if (volWeightGrams > 30000) {
            msg += `<div style="color:red; font-weight:bold;">โปรดใช้ บริการ EMS Jumbo</div>`;
            resultBox.innerHTML = msg;
            return;
        }

        // Compare with stored Actual Weight
        const weightToUse = Math.max(volWeightGrams, currentActualWeight);
        const newPrice = getEMSRate(weightToUse);

        if (newPrice !== null) {
            if (volWeightGrams > currentActualWeight) {
                msg += `<div style="color:var(--primary); font-weight:bold;">Volumetric weight is higher.</div>`;
                msg += `<div style="margin-bottom:10px;">New EMS Price: ${newPrice} ฿</div>`;

                // Add Confirm Button
                msg += `
                    <button onclick="applyVolumetricWeight(${volWeightGrams}, ${newPrice})" 
                        style="background:var(--primary); color:white; border:none; padding:8px 15px; border-radius:5px; cursor:pointer; width:100%; margin-top:5px;">
                        Use Volumetric Weight
                    </button>
                    <div style="font-size:0.8em; color:#666; margin-top:5px;">Click to update price and insurance base.</div>
                `;
            } else {
                msg += `<div style="color:green;">Actual weight (${currentActualWeight}g) is higher/equal. Price unchanged.</div>`;
            }
        } else {
            msg += `<div style="color:red; font-weight:bold;">Weight exceeds EMS limit (30kg).</div>`;
        }

        resultBox.innerHTML = msg;

    } else {
        resultBox.innerHTML = `<div style="color:#555;">Dimensions within standard size. Use actual weight.</div>`;
    }
}

function applyVolumetricWeight(weightGrams, price) {
    // Update UI for EMS Card
    const cards = document.querySelectorAll('.result-card');
    cards.forEach(card => {
        const titleEl = card.querySelector('.service-name');
        if (titleEl && titleEl.innerText.toLowerCase().includes('ems')) {
            // 1. Update Base Price Attribute for Add-ons Logic
            card.setAttribute('data-base-price', price);

            // 2. Call updateCardTotal to refresh display (inc. any checked AR)
            // This handles the Price Text update internally
            updateCardTotal(card.querySelector('.ar-checkbox') || card);

            // 3. Update Weight Display with Volumetric Info
            const weightEl = card.querySelector('.service-info div:nth-child(2)');
            if (weightEl) {
                weightEl.innerHTML = `
                    <span style="color:#d9534f; font-weight:bold;">
                        Weight: ${weightGrams}g (Volumetric)
                    </span>
                    <span title="Original Actual Weight: ${currentActualWeight}g" style="cursor:help; color:#555; margin-left:5px;">
                        <i class="fa-solid fa-circle-info"></i>
                    </span>
                 `;
            }

            // Update global base price for insurance modal reference
            currentBasePrice = price;
        }
    });

    closeDimModal();
}

function calculateJumbo(e) {
    try {
        if (e) e.preventDefault();

        const silent = !e; // Auto-calc mode if no event passed

        // 1. Get Inputs
        const originProv = document.getElementById('jumboOrigin').value;
        const destProv = document.getElementById('jumboDest').value;
        const weightGm = parseFloat(document.getElementById('jumboWeight').value) || 0;
        const width = parseFloat(document.getElementById('jumboWidth').value) || 0;
        const length = parseFloat(document.getElementById('jumboLength').value) || 0;
        const height = parseFloat(document.getElementById('jumboHeight').value) || 0;

        // 2. Validate inputs
        if (!originProv || !destProv) {
            if (!silent) alert("Please select Origin and Destination provinces.");
            return;
        }

        // Check Mode
        const mode = document.querySelector('input[name="jumboMode"]:checked') ? document.querySelector('input[name="jumboMode"]:checked').value : 'weight';

        if (mode === 'weight') {
            if (weightGm <= 0) {
                if (!silent) alert("Please enter a valid weight.");
                return;
            }
            // Strict check on dims for auto-calc?
            /* 
            if (width <= 0 || length <= 0 || height <= 0) {
                if (!silent) alert("Please enter valid dimensions.");
                return;
            }
            */
            // Allow partial calc? No, rate needs volume sometimes? 
            // Rate is based on Charge Weight (Max of Actual vs Vol).
            // If Vol is 0, Charge Weight = Actual.
            // So Dims are optional for basic price?
            // BUT Jumbo usually enforces dims.
            // Let's enforce it.
            if (width <= 0 || length <= 0 || height <= 0) {
                if (!silent) alert("Please enter valid dimensions.");
                return;
            }
        }

        // 3. Determine Zones
        // Ensure emsJumboZones is available
        if (typeof emsJumboZones === 'undefined') {
            console.error("emsJumboZones not found");
            if (!silent) alert("Data Error: emsJumboZones missing");
            return;
        }

        const originZone = emsJumboZones[originProv];
        const destZone = emsJumboZones[destProv];

        if (!originZone || !destZone) {
            alert("Invalid Zone! Please check province data.");
            return;
        }

        // Mode already checked above

        let basePrice = 0;
        let chargeWeight = 0; // Display purpose
        let weightStep = 0;   // Display purpose
        let dimSurcharge = 0;

        // Fix: Declare these here so they are available for display
        let usedWeight = 0;
        let weightTypeStr = '';

        if (mode === 'item') {
            const itemId = document.getElementById('jumboItemSelect').value;
            if (!itemId) {
                alert("Please select an item.");
                return;
            }

            // Lookup in emsJumboFixedRates
            if (typeof emsJumboFixedRates !== 'undefined' && emsJumboFixedRates[originZone] && emsJumboFixedRates[originZone][itemId]) {
                basePrice = emsJumboFixedRates[originZone][itemId][destZone];
                if (!basePrice) {
                    alert(`Price not available for this route (Zone ${originZone} -> ${destZone})`);
                    return;
                }
            } else {
                alert(`Item rates not loaded for Origin Zone ${originZone} yet.`);
                return;
            }

        } else {
            // Weight Mode (Existing Logic)
            const weightGm = parseFloat(document.getElementById('jumboWeight').value) || 0;
            const width = parseFloat(document.getElementById('jumboWidth').value) || 0;
            const length = parseFloat(document.getElementById('jumboLength').value) || 0;
            const height = parseFloat(document.getElementById('jumboHeight').value) || 0;

            if (weightGm <= 0) { alert("Please enter weight."); return; }
            // Strict check on dims for auto-calc logic
            if (width <= 0 || length <= 0 || height <= 0) {
                if (!silent) alert("Please enter valid dimensions.");
                return;
            }

            // 4. Calculate Weight (Actual vs Volumetric)
            const weightKg = weightGm / 1000;
            const volWeightKg = (width * length * height) / 6000;

            usedWeight = Math.max(weightKg, volWeightKg); // Determine which is used
            chargeWeight = Math.ceil(usedWeight);

            weightTypeStr = (weightKg >= volWeightKg) ? 'Actual Weight' : 'Volumetric Weight';

            // Step logic: 30, 40, 50... 200.
            weightStep = 30;
            if (chargeWeight > 200) {
                alert("Over 200kg! Consult Thai Post.");
                return;
            }
            if (chargeWeight > 30) {
                weightStep = Math.ceil(chargeWeight / 10) * 10;
            }

            // 5. Lookup Price
            if (typeof emsJumboRates !== 'undefined' && emsJumboRates[originZone] && emsJumboRates[originZone][weightStep]) {
                basePrice = emsJumboRates[originZone][weightStep][destZone];
            } else {
                console.warn(`Rate not found for Z${originZone}->Z${destZone} @ ${weightStep}kg`);
                // Maybe alert?
            }

            // 6. Surcharges (Dimensions)
            const dims = [width, length, height];
            const maxSide = Math.max(...dims);
            if (typeof emsJumboDimSurcharges !== 'undefined') {
                for (let s of emsJumboDimSurcharges) {
                    if (maxSide > s.min && maxSide <= s.max) {
                        dimSurcharge = s.price;
                        break;
                    }
                }
            }
        }


        // 7. Insurance Calculation
        let insuranceFee = 0;
        const declaredValueInput = document.getElementById('jumboDeclaredValue');
        const declaredValue = parseFloat(declaredValueInput ? declaredValueInput.value : 0) || 0;

        if (declaredValue > 0) {
            if (declaredValue > 200000) {
                alert("Declared value cannot exceed 200,000 THB");
                return;
            }

            let ratePerUnit = 0;
            let units = Math.ceil(declaredValue / 500);

            // Use global config if available, else element
            const serviceFee = (typeof emsJumboInsurance !== 'undefined') ? emsJumboInsurance.serviceFee : 15;

            if (declaredValue <= 20000) {
                ratePerUnit = 5.00;
            } else {
                ratePerUnit = 6.00;
            }

            insuranceFee = (units * ratePerUnit) + serviceFee;
        }

        // 7.5 Remote Area Surcharge (Island/Remote +100)
        let remoteSurcharge = 0;
        const isRemote = document.getElementById('jumboIsRemote') ? document.getElementById('jumboIsRemote').checked : false;
        if (isRemote) {
            remoteSurcharge = 100;
        }

        // 7.6 Pickup & Delivery Fees (Corrected logic)
        let pickupFee = 0;
        let deliveryFee = 0;

        if (document.getElementById('jumboPickup') && document.getElementById('jumboPickup').checked) {
            pickupFee = 30; // Standard pickup fee
        }
        if (document.getElementById('jumboDelivery') && document.getElementById('jumboDelivery').checked) {
            deliveryFee = 20; // Additional delivery fee (if applicable)
        }

        // 8. Display Result
        const totalPrice = basePrice + dimSurcharge + insuranceFee + remoteSurcharge + pickupFee + deliveryFee;

        const resultDiv = document.getElementById('result');
        if (resultDiv) {
            // Determine weight string key
            const weightTypeKey = (weightKg >= volWeightKg) ? 'jumboActualWeight' : 'jumboVolumetricWeight';

            let detailsHtml = `
                <h3>${t('jumboRateTitle')}</h3>
                <p><strong>${t('jumboRoute')}:</strong> ${originZone} -> ${destZone}</p>
                <p><strong>${t('jumboChargeWeight')}:</strong> ${chargeWeight} kg (<strong>${t('jumboStep')}:</strong> ${weightStep})</p>
                <p style="color:#555; font-size:0.9em;">(${t(weightTypeKey)} ${t('jumboUsed')}: ${usedWeight.toFixed(2)} kg)</p>
                <p><strong>${t('jumboBasePrice')}:</strong> ${basePrice.toLocaleString()} THB</p>
            `;

            if (dimSurcharge > 0) {
                const maxSide = Math.max(width, length, height);
                detailsHtml += `<p style="color:#e65100;"><strong>${t('jumboDimSurcharge')}:</strong> +${dimSurcharge.toLocaleString()} THB (${t('jumboMaxSide')}: ${maxSide}cm)</p>`;
            }

            if (insuranceFee > 0) {
                detailsHtml += `<p style="color:#1565c0;"><strong>${t('jumboInsuranceFee')}:</strong> +${insuranceFee.toLocaleString()} THB (${t('jumboValue')}: ${declaredValue.toLocaleString()})</p>`;
            }

            if (remoteSurcharge > 0) {
                detailsHtml += `<p style="color:#d32f2f;"><strong>${t('jumboRemoteSurcharge')}:</strong> +${remoteSurcharge.toLocaleString()} THB</p>`;
            }

            if (pickupFee > 0) detailsHtml += `<p style="color:#2e7d32;"><strong>${t('jumboPickupFee')}:</strong> +${pickupFee} THB</p>`;
            if (deliveryFee > 0) detailsHtml += `<p style="color:#2e7d32;"><strong>${t('jumboDeliveryFee')}:</strong> +${deliveryFee} THB</p>`;

            detailsHtml += `<h2 style="color:#d32f2f; margin-top:10px; border-top:1px solid #ccc; padding-top:10px;">${t('jumboTotal')}: ${totalPrice.toLocaleString()} THB</h2>`;

            resultDiv.innerHTML = detailsHtml;
            document.getElementById('resultCard').style.display = 'block';
            document.getElementById('resultCard').scrollIntoView({ behavior: 'smooth' });
        }
    } catch (err) {
        console.error("Jumbo Calc Error:", err);
        alert("System Error during calculation: " + err.message);
    }
}

// Helper for Volumetric (Jumbo)
function autoCalcJumboVol() {
    const w = parseFloat(document.getElementById('jumboWidth').value) || 0;
    const l = parseFloat(document.getElementById('jumboLength').value) || 0;
    const h = parseFloat(document.getElementById('jumboHeight').value) || 0;
    const vol = (w * l * h) / 6000;
    const volInput = document.getElementById('jumboVolWeight');
    if (volInput) volInput.value = vol.toFixed(2);
}

// Enter Key Navigation
document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        const target = e.target;
        if (target.tagName === 'INPUT' && target.closest('#jumboForm')) {
            e.preventDefault();
            const form = target.form;
            const index = Array.prototype.indexOf.call(form, target);
            if (form.elements[index + 1]) {
                form.elements[index + 1].focus();
            }
        }
    }
});
// Removed Clear Inputs placeholder as it's defined below properly


// Modal Functions
function openInfoModal() {
    const modal = document.getElementById('infoModal');
    modal.classList.add('show');
    // Default to current tab
    switchInfoTab(currentTab === 'international' ? 'international' : 'domestic');
}

function closeInfoModal() {
    document.getElementById('infoModal').classList.remove('show');
}

function switchInfoTab(type) {
    // Hide all
    document.querySelectorAll('.info-img-container').forEach(el => el.classList.remove('show'));
    document.querySelectorAll('.modal-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));

    // Show specific
    document.getElementById(`info-${type}`).classList.add('show');

    // Update active button (simple finder)
    const buttons = document.querySelectorAll('.modal-tabs .tab-btn');
    if (type === 'domestic') buttons[0].classList.add('active');
    else buttons[1].classList.add('active');
}

// Close modal if clicked outside
window.onclick = function (event) {
    const modal = document.getElementById('infoModal');
    if (event.target == modal) {
        closeInfoModal();
    }
    const settingsModal = document.getElementById('settingsModal');
    if (event.target == settingsModal) {
        closeSettingsModal();
    }
}

// Settings Modal
function openSettingsModal() {
    document.getElementById('settingsModal').classList.add('show');
    // Highlight current setting
    const saved = localStorage.getItem('thp_lang') || 'th';
    highlightLangSetting(saved);
}

function closeSettingsModal() {
    document.getElementById('settingsModal').classList.remove('show');
}

function setDefaultLang(lang) {
    localStorage.setItem('thp_lang', lang); // Save Preference only here
    changeLanguage(lang);
    highlightLangSetting(lang);
}

function highlightLangSetting(lang) {
    document.getElementById('setLangTh').classList.toggle('active', lang === 'th');
    document.getElementById('setLangEn').classList.toggle('active', lang === 'en');

    // Style adjustments for buttons
    if (lang === 'th') {
        document.getElementById('setLangTh').style.background = 'var(--primary)';
        document.getElementById('setLangTh').style.color = 'white';
        document.getElementById('setLangEn').style.background = 'white';
        document.getElementById('setLangEn').style.color = '#666';
    } else {
        document.getElementById('setLangEn').style.background = 'var(--primary)';
        document.getElementById('setLangEn').style.color = 'white';
        document.getElementById('setLangTh').style.background = 'white';
        document.getElementById('setLangTh').style.color = '#666';
    }
}

// function checkAdminAuth() {
//     const password = prompt(currentLang === 'en' ? "Enter Admin Password:" : "กรุณาใส่รหัสผ่าน Admin:");
//     if (password === "37977310501") {
//         window.location.href = "admin.html";
//     } else if (password !== null) {
//         alert(currentLang === 'en' ? "Incorrect Password!" : "รหัสผ่านไม่ถูกต้อง!");
//     }
// }

function checkAdminAuth() {
    // Open Custom Modal instead of Prompt
    closeSettingsModal(); // Close parent modal first
    const modal = document.getElementById('adminAuthModal');
    if (modal) {
        modal.classList.add('show');
        // Focus input
        setTimeout(() => document.getElementById('adminPasswordInput').focus(), 100);
    }
}

function closeAdminAuthModal() {
    const modal = document.getElementById('adminAuthModal');
    if (modal) modal.classList.remove('show');
    // Clear input
    document.getElementById('adminPasswordInput').value = '';
}

function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById('icon-' + inputId);

    if (input.type === "password") {
        input.type = "text";
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = "password";
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

function submitAdminAuth(e) {
    e.preventDefault();
    const password = document.getElementById('adminPasswordInput').value;

    // Dynamic Password Check
    const savedPass = localStorage.getItem('thp_admin_pass') || "37977310501";

    if (password === savedPass) {
        window.location.href = "admin.html";
    } else {
        alert(currentLang === 'en' ? "Incorrect Password!" : "รหัสผ่านไม่ถูกต้อง!");
    }
}

// --- EMS Jumbo Logic ---

setTimeout(initJumboData, 500);

function initJumboData() {
    // Populate Jumbo Dropdowns
    if (typeof emsJumboZones !== 'undefined') {
        const provinces = Object.keys(emsJumboZones).sort();
        const originSelect = document.getElementById('jumboOrigin');
        const destSelect = document.getElementById('jumboDest');

        const populate = (select, lang = currentLang) => {
            if (!select) return;
            const currentVal = select.value; // Preserve selection
            select.innerHTML = `<option value="" disabled selected data-i18n="optSelectProvince">${t('optSelectProvince')}</option>`;
            provinces.forEach(prov => {
                const opt = document.createElement('option');
                opt.value = prov;

                // Determine Label based on Lang
                let label = prov; // Default EN
                const thName = (typeof emsJumboProvinceTH !== 'undefined') ? emsJumboProvinceTH[prov] : prov;

                if (lang === 'th') {
                    label = `${thName} (${prov})`;
                } else {
                    label = prov; // EN only
                }

                opt.textContent = label;
                select.appendChild(opt);
            });
            if (currentVal) select.value = currentVal;
        };

        populate(originSelect, currentLang);
        populate(destSelect, currentLang);
    }

    const itemSel = document.getElementById('jumboItemSelect');
    if (itemSel && typeof emsJumboItems !== 'undefined') {
        let itemHtml = '<option value="" disabled selected>เลือกสินค้า (Select Item)...</option>';
        emsJumboItems.forEach(item => {
            itemHtml += `<option value="${item.id}">[${item.category}] ${item.name}</option>`;
        });
        itemSel.setAttribute('data-item-options', itemHtml);
    }
}

// ... (toggleJumboMode etc remaining same, skipping to checkJumboRemoteArea update)

function calculateJumboRate(e) {
    if (e) e.preventDefault();
    const originProv = document.getElementById('jumboOrigin').value;
    const destProv = document.getElementById('jumboDest').value;

    if (!originProv || !destProv) return alert("กรุณาเลือกจังหวัดต้นทางและปลายทาง (Select Origin/Dest)");

    const originZone = emsJumboZones[originProv];
    const destZone = emsJumboZones[destProv];
    if (!originZone || !destZone) return alert("System Error: Invalid Zone Data");

    const mode = document.querySelector('input[name="jumboMode"]:checked').value;
    let basePrice = 0, surcharge = 0, insurance = 0, pickup = 0, delivery = 0, remote = 0;
    let details = "";

    if (mode === 'item') {
        const itemSel = document.getElementById('jumboItemSelect');
        const itemId = itemSel.value;
        if (!itemId || isNaN(itemId)) return alert("กรุณาเลือกสินค้า (Select Item)");

        const rates = emsJumboFixedRates[originZone] && emsJumboFixedRates[originZone][itemId];
        if (rates && rates[destZone]) {
            basePrice = rates[destZone];
            const itemObj = emsJumboItems.find(i => i.id == itemId);
            details = `Mode: สินค้าสำเร็จรูป (${itemObj ? itemObj.name : itemId})`;
        } else {
            return alert("ไม่พบข้อมูลราคาสำหรับสินค้านี้ในเส้นทางนี้");
        }

        // Item specific surcharges (if any)
        if (typeof emsJumboItemSurcharges !== 'undefined') {
            const sObj = emsJumboItemSurcharges.find(s => s.id == itemId);
            if (sObj) surcharge += sObj.price;
        }

    } else if (mode === 'weight') {
        const weight = parseFloat(document.getElementById('jumboWeight').value) || 0;
        const volWeight = parseFloat(document.getElementById('jumboVolWeight').value) || 0;
        const useWeight = Math.max(weight, volWeight * 1000); // Compare grams vs volKG*1000

        if (useWeight <= 0) return alert("กรุณาระบุน้ำหนัก (Enter Weight)");
        if (useWeight > 200000) return alert("น้ำหนักเกินกำหนด 200 กก. (Max 200kg)");

        // Rate Calculation
        // Step: find weight step (30, 40, ... 200)
        let step = Math.ceil(useWeight / 1000); // kg
        if (step < 30) step = 30; // Min 30kg
        else if (step % 10 !== 0) step = Math.ceil(step / 10) * 10; // Round up to nearest 10

        if (step > 200) step = 200;

        const zoneRates = emsJumboRates[originZone];
        if (zoneRates && zoneRates[step] && zoneRates[step][destZone]) {
            basePrice = zoneRates[step][destZone];
            details = `Mode: คำนวณตามน้ำหนัก (${useWeight}g -> Charge ${step}kg)`;
        } else {
            return alert("ไม่พบอัตราค่าบริการ (Rate not found)");
        }

        // Dim Surcharge
        const w = parseFloat(document.getElementById('jumboWidth').value) || 0;
        const l = parseFloat(document.getElementById('jumboLength').value) || 0;
        const h = parseFloat(document.getElementById('jumboHeight').value) || 0;
        const maxSide = Math.max(w, l, h);
        if (typeof emsJumboDimSurcharges !== 'undefined') {
            for (let s of emsJumboDimSurcharges) {
                if (maxSide > s.min && maxSide <= s.max) surcharge = s.price;
            }
        }
    }

    if (document.getElementById('jumboRemoteArea').checked) remote = 100;

    // Fees
    const feeCalc = (p) => {
        if (typeof emsJumboPickupDeliveryFees !== 'undefined') {
            for (let t of emsJumboPickupDeliveryFees) if (p <= t.max) return t.fee;
        }
        return 500;
    };
    if (document.getElementById('jumboPickup').checked) {
        pickup = (mode === 'pallet') ? 100 * (parseInt(document.getElementById('jumboPalletQty').value) || 1) : feeCalc(basePrice);
    }
    if (document.getElementById('jumboDelivery').checked) {
        delivery = (mode === 'pallet') ? 100 * (parseInt(document.getElementById('jumboPalletQty').value) || 1) : feeCalc(basePrice);
    }

    const val = parseFloat(document.getElementById('jumboDeclaredValue').value) || 0;
    if (val > 0) insurance = 15 + (Math.ceil(val / 500) * 5);

    const total = basePrice + surcharge + remote + pickup + delivery + insurance;

    document.getElementById('result').innerHTML = `
        <h3 style="color:var(--primary);">สรุปค่าบริการ EMS Jumbo</h3>
        <p style="font-size:1.1rem; border-bottom:1px solid #eee; padding-bottom:5px; margin-bottom:10px;">
            <strong>${details}</strong><br>
            <span style="font-size:0.9rem; color:#666;">เส้นทาง: ${originProv} -> ${destProv} (Zone ${originZone}->${destZone})</span>
        </p>
        
        <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
            <span>ค่าบริการพื้นฐาน (Base Price):</span>
            <strong>${basePrice.toLocaleString()} ฿</strong>
        </div>
        ${surcharge > 0 ? `<div style="display:flex; justify-content:space-between; color:#e65100;"><span>Dim Surcharge:</span><span>+${surcharge} ฿</span></div>` : ''}
        ${remote > 0 ? `<div style="display:flex; justify-content:space-between; color:#c62828;"><span>Remote Area:</span><span>+${remote} ฿</span></div>` : ''}
        ${pickup > 0 ? `<div style="display:flex; justify-content:space-between; color:#2e7d32;"><span>Pickup:</span><span>+${pickup} ฿</span></div>` : ''}
        ${delivery > 0 ? `<div style="display:flex; justify-content:space-between; color:#2e7d32;"><span>Delivery:</span><span>+${delivery} ฿</span></div>` : ''}
        ${insurance > 0 ? `<div style="display:flex; justify-content:space-between; color:#1565c0;"><span>Insurance:</span><span>+${insurance} ฿</span></div>` : ''}
        
        <div style="background:#f8f9fa; padding:10px; border-radius:8px; margin-top:10px; text-align:right;">
            <span style="font-size:1.2rem; font-weight:bold; color:#333; margin-right:10px;">รวมสุทธิ (Total):</span>
            <span style="font-size:1.5rem; font-weight:800; color:#d32f2f;">${total.toLocaleString()} ฿</span>
        </div>
    `;
    document.getElementById('resultCard').style.display = 'block';
    document.getElementById('resultCard').scrollIntoView({ behavior: 'smooth' });
}

function checkJumboRemoteArea() {
    const zipEl = document.getElementById('jumboZipcode');
    const remoteCb = document.getElementById('jumboRemoteArea');
    if (!zipEl || !remoteCb) return;

    const val = zipEl.value.trim();
    if (val.length >= 2) {
        // Auto-select Province by Prefix
        if (typeof emsJumboZipMap !== 'undefined') {
            const prefix = val.substring(0, 2);
            // Handle special cases matching logic if needed, but direct map is fine
            if (emsJumboZipMap[prefix]) {
                const prov = emsJumboZipMap[prefix];
                const destSel = document.getElementById('jumboDest');
                if (destSel && destSel.value !== prov) {
                    destSel.value = prov;
                    // Visual feedback flash?
                }
            }
        }
    }

    if (typeof emsJumboRemoteZipcodes !== 'undefined' && val.length === 5) {
        const isRemote = emsJumboRemoteZipcodes.includes(val);
        if (isRemote) {
            remoteCb.checked = true;
            remoteCb.parentElement.style.color = "#d32f2f";
            remoteCb.parentElement.style.fontWeight = "bold";
        } else {
            remoteCb.checked = false;
            remoteCb.parentElement.style.color = "";
            remoteCb.parentElement.style.fontWeight = "normal";
        }
    }
}

function checkJumboZipMatch() {
    const zipEl = document.getElementById('jumboZipcode');
    const destSel = document.getElementById('jumboDest');
    const warningEl = document.getElementById('jumboZipWarning');
    if (!zipEl || !destSel || !warningEl) return;

    const zip = zipEl.value.trim();
    if (zip.length < 2) {
        warningEl.style.display = 'none';
        return;
    }

    const prov = destSel.value;
    if (!prov || typeof emsJumboZipMap === 'undefined') return;

    // Check if zip matches selected province
    // emsJumboZipMap maps prefix -> Province Name
    // We reverse check: Find all prefixes for the current province or check strict mapping?
    // Map is Prefix -> Prov. So:
    const prefix = zip.substring(0, 2);
    const mappedProv = emsJumboZipMap[prefix];

    // If mappedProv exists AND it is different from selected prov -> Mismatch
    // Note: Some provinces share prefixes (like 10 for BKK), so we need careful check.
    // If mismatch, show warning.

    if (mappedProv && mappedProv !== prov) {
        // Special case: BKK/Nonthaburi/Pathum often share 10-12 and get mixed? 
        // 10->BKK, 11->Nonthaburi, 12->Pathum Thani. They are distinct.
        // So strict check should be fine.
        warningEl.style.display = 'inline-block';
        warningEl.querySelector('span').innerText = t('msgZipMismatch');
    } else {
        warningEl.style.display = 'none';
    }

    // Also trigger Remote Check
    checkJumboRemoteArea();
}

function toggleJumboMode() {
    const modeEl = document.querySelector('input[name="jumboMode"]:checked');
    if (!modeEl) return;
    const mode = modeEl.value;

    // Weight Inputs
    ['jumboWeight', 'jumboWidth', 'jumboLength', 'jumboHeight'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.disabled = (mode !== 'weight');
            el.closest('.form-group').style.opacity = (mode === 'weight') ? '1' : '0.5';
            if (mode !== 'weight') el.value = '';
        }
    });

    // Pallet Group
    const palletGroup = document.getElementById('jumboPalletGroup');
    if (palletGroup) palletGroup.style.display = (mode === 'pallet') ? 'block' : 'none';

    // Item/Service Selector
    const itemSel = document.getElementById('jumboItemSelect');
    if (itemSel) {
        if (mode === 'item') {
            itemSel.disabled = false;
            itemSel.style.cursor = 'pointer';
            itemSel.style.background = '#fff';
            itemSel.style.color = '#333';
            itemSel.style.opacity = '1';

            // Restore options/rebuild
            const opts = itemSel.getAttribute('data-item-options');
            if (opts && itemSel.innerHTML.indexOf('option') < 50) itemSel.innerHTML = opts;

        } else {
            itemSel.disabled = true;
            itemSel.style.cursor = 'not-allowed';
            itemSel.style.background = '#eee';
            itemSel.style.color = '#999';
            itemSel.style.opacity = '0.6';

            const text = (mode === 'pallet') ? "เหมาจ่าย Roll Pallet (N/A)" : "คำนวณตามน้ำหนัก (Weight Mode)";
            itemSel.innerHTML = `<option selected>${text}</option>`;
        }
    }
}

function calculateJumboRate(e) {
    if (e) e.preventDefault();
    const originProv = document.getElementById('jumboOrigin').value;
    const destProv = document.getElementById('jumboDest').value;

    if (!originProv || !destProv) return alert("กรุณาเลือกจังหวัดต้นทางและปลายทาง (Select Origin/Dest)");

    const originZone = emsJumboZones[originProv];
    const destZone = emsJumboZones[destProv];
    if (!originZone || !destZone) return alert("System Error: Invalid Zone Data");

    const mode = document.querySelector('input[name="jumboMode"]:checked').value;
    let basePrice = 0, surcharge = 0, insurance = 0, pickup = 0, delivery = 0, remote = 0;
    let details = "";

    if (mode === 'item') {
        const itemSel = document.getElementById('jumboItemSelect');
        const itemId = itemSel.value;
        if (!itemId || itemSel.disabled) return alert("กรุณาเลือกสินค้า (Select Item)");

        const itemTxt = itemSel.options[itemSel.selectedIndex].text;
        if (emsJumboFixedRates[originZone] && emsJumboFixedRates[originZone][itemId]) {
            basePrice = emsJumboFixedRates[originZone][itemId][destZone];
        } else {
            return alert("ไม่พบราคาสำหรับสินค้านี้ในเส้นทางที่เลือก");
        }
        details = `สินค้า: ${itemTxt}`;

    } else if (mode === 'pallet') {
        const qty = parseInt(document.getElementById('jumboPalletQty').value) || 1;
        const type = document.getElementById('jumboPalletUserType').value;

        // Pallet Rate Logic
        let rate = 1000;
        if (emsJumboPalletRates && emsJumboPalletRates[destZone]) {
            rate = emsJumboPalletRates[destZone];
        }
        if (type === 'student') rate = 300;
        else if (type === 'otop') rate *= 0.8;

        basePrice = rate * qty;
        details = `Roll Pallet (${type}) x${qty}`;

    } else {
        // Weight
        const wGm = parseFloat(document.getElementById('jumboWeight').value) || 0;
        const w = parseFloat(document.getElementById('jumboWidth').value) || 0;
        const l = parseFloat(document.getElementById('jumboLength').value) || 0;
        const h = parseFloat(document.getElementById('jumboHeight').value) || 0;
        if (wGm <= 0) return alert("กรุณากรอกน้ำหนัก (Enter Weight)");

        let chgW = Math.max(wGm / 1000, (w * l * h) / 6000);
        chgW = Math.ceil(chgW);

        if (emsJumboRates[originZone]) {
            for (let s in emsJumboRates[originZone]) {
                if (chgW <= parseInt(s)) {
                    basePrice = emsJumboRates[originZone][s][destZone];
                    break;
                }
            }
        }
        if (!basePrice) return alert("น้ำหนักเกินพิกัด หรือไม่พบข้อมูลราคา");
        details = `น้ำหนักคำนวณ: ${chgW} กก.`;

        const maxSide = Math.max(w, l, h);
        if (typeof emsJumboDimSurcharges !== 'undefined') {
            for (let s of emsJumboDimSurcharges) {
                if (maxSide > s.min && maxSide <= s.max) surcharge = s.price;
            }
        }
    }

    if (document.getElementById('jumboRemoteArea').checked) remote = 100;

    // Fees
    const feeCalc = (p) => {
        if (typeof emsJumboPickupDeliveryFees !== 'undefined') {
            for (let t of emsJumboPickupDeliveryFees) if (p <= t.max) return t.fee;
        }
        return 500;
    };
    if (document.getElementById('jumboPickup').checked) {
        pickup = (mode === 'pallet') ? 100 * (parseInt(document.getElementById('jumboPalletQty').value) || 1) : feeCalc(basePrice);
    }
    if (document.getElementById('jumboDelivery').checked) {
        delivery = (mode === 'pallet') ? 100 * (parseInt(document.getElementById('jumboPalletQty').value) || 1) : feeCalc(basePrice);
    }

    const val = parseFloat(document.getElementById('jumboDeclaredValue').value) || 0;
    if (val > 0) insurance = 15 + (Math.ceil(val / 500) * 5);

    const total = basePrice + surcharge + remote + pickup + delivery + insurance;

    document.getElementById('result').innerHTML = `
        <h3 style="color:var(--primary);">สรุปค่าบริการ EMS Jumbo</h3>
        <p style="font-size:1.1rem; border-bottom:1px solid #eee; padding-bottom:5px; margin-bottom:10px;">
            <strong>${details}</strong><br>
            <span style="font-size:0.9rem; color:#666;">เส้นทาง: ${originProv} -> ${destProv} (Zone ${originZone}->${destZone})</span>
        </p>
        
        <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
            <span>ค่าบริการพื้นฐาน (Base Price):</span>
            <strong>${basePrice.toLocaleString()} ฿</strong>
        </div>
        ${surcharge > 0 ? `<div style="display:flex; justify-content:space-between; color:#e65100;"><span>Dim Surcharge:</span><span>+${surcharge} ฿</span></div>` : ''}
        ${remote > 0 ? `<div style="display:flex; justify-content:space-between; color:#c62828;"><span>Remote Area:</span><span>+${remote} ฿</span></div>` : ''}
        ${pickup > 0 ? `<div style="display:flex; justify-content:space-between; color:#2e7d32;"><span>Pickup:</span><span>+${pickup} ฿</span></div>` : ''}
        ${delivery > 0 ? `<div style="display:flex; justify-content:space-between; color:#2e7d32;"><span>Delivery:</span><span>+${delivery} ฿</span></div>` : ''}
        ${insurance > 0 ? `<div style="display:flex; justify-content:space-between; color:#1565c0;"><span>Insurance:</span><span>+${insurance} ฿</span></div>` : ''}
        
        <div style="background:#f8f9fa; padding:10px; border-radius:8px; margin-top:10px; text-align:right;">
            <span style="font-size:1.2rem; font-weight:bold; color:#333; margin-right:10px;">รวมสุทธิ (Total):</span>
            <span style="font-size:1.5rem; font-weight:800; color:#d32f2f;">${total.toLocaleString()} ฿</span>
        </div>
    `;
    document.getElementById('resultCard').style.display = 'block';
    document.getElementById('resultCard').scrollIntoView({ behavior: 'smooth' });
}


function toggle2026Inputs() {
    const chk = document.getElementById('use2026Rates');
    const div = document.getElementById('zipInputs2026');
    if (chk && div) {
        div.style.display = chk.checked ? 'block' : 'none';

        // Auto-focus if shown
        if (chk.checked) {
            document.getElementById('originZip').focus();
        }
    }
}

function checkPartialZip(type) {
    const inputId = type === 'origin' ? 'originZip' : 'destZip';
    const checkId = type === 'origin' ? 'originPartialCheck' : 'destPartialCheck';
    const labelId = type === 'origin' ? 'originPartialLabel' : 'destPartialLabel';
    const checkboxId = type === 'origin' ? 'isOriginRemote' : 'isDestRemote';

    const zip = document.getElementById(inputId).value;
    const checkDiv = document.getElementById(checkId);

    // Check if zip exists in our data and is partial
    // We need access to remoteGroups2026 or a helper. 
    // Since getRemoteGroup2026 is global now from data2026.js:
    if (typeof getRemoteGroup2026 === 'function') {
        const groupInfo = getRemoteGroup2026(zip);

        if (groupInfo && groupInfo.isPartial) {
            checkDiv.style.display = 'block';
            document.getElementById(labelId).innerText = `${t('labelPartialAreaPrefix')}${groupInfo.remark}?`;
        } else {
            checkDiv.style.display = 'none';
            document.getElementById(checkboxId).checked = false; // Reset if hidden
        }
    }
}

// Mobile Tab Scroll Logic
function initScrollTabs() {
    const tabs = document.getElementById('tabsContainer');
    if (!tabs) return;

    function updateGradients() {
        // Show Left Fade if scrolled > 10px
        const canScrollLeft = tabs.scrollLeft > 10;

        // Show Right Fade if not at end (with buffer)
        // scrollWidth - clientWidth = maxScrollLeft
        const maxScroll = tabs.scrollWidth - tabs.clientWidth;
        const canScrollRight = Math.ceil(tabs.scrollLeft) < maxScroll - 10;

        const wrapper = tabs.parentElement;
        if (wrapper) {
            if (canScrollLeft) wrapper.classList.add('can-scroll-left');
            else wrapper.classList.remove('can-scroll-left');

            if (canScrollRight) wrapper.classList.add('can-scroll-right');
            else wrapper.classList.remove('can-scroll-right');
        }
    }

    // Smart Wiggle Animation
    function triggerSmartWiggle() {
        const maxScroll = tabs.scrollWidth - tabs.clientWidth;
        const atStart = tabs.scrollLeft < 10;
        const atEnd = Math.ceil(tabs.scrollLeft) >= maxScroll - 10;
        const canScrollRight = !atEnd;
        const canScrollLeft = !atStart;

        // Remove any existing classes to restart animation if needed
        tabs.classList.remove('wiggle-hint-right', 'wiggle-hint-left');

        // Force reflow
        void tabs.offsetWidth;

        if (canScrollRight) {
            // If can scroll right, wiggle to show content on the right (move left)
            tabs.classList.add('wiggle-hint-right');
        } else if (canScrollLeft) {
            // If at end, wiggle to show content on the left (move right)
            tabs.classList.add('wiggle-hint-left');
        }

        // Cleanup classes after animation (1s)
        setTimeout(() => {
            tabs.classList.remove('wiggle-hint-right', 'wiggle-hint-left');
        }, 1000);
    }

    // Initial wiggle on load
    setTimeout(triggerSmartWiggle, 500);

    // Repeat every 15 seconds
    setInterval(triggerSmartWiggle, 15000);

    // Attach listener
    tabs.addEventListener('scroll', updateGradients);
    window.addEventListener('resize', updateArrows);

    // Initial check (delay slightly for layout)
    setTimeout(updateArrows, 100);
    setTimeout(updateArrows, 500); // Retry logic for slow rendering
}

function scrollTabs(direction) {
    const tabs = document.getElementById('tabsContainer');
    if (!tabs) return;

    const scrollAmount = 150;
    if (direction === 'left') {
        tabs.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
        tabs.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
}

// Call init functionality
document.addEventListener('DOMContentLoaded', initScrollTabs);

// Prohibited Items Modal Logic
function openProhibitedModal() {
    const modal = document.getElementById('prohibitedModal');
    const iframe = document.getElementById('prohibitedFrame');
    const loading = document.getElementById('prohibitedLoading');

    if (!modal || !iframe) return;

    // Show Modal
    modal.style.display = 'block';

    // Context-Aware URL
    // Responsive Anchor: Use #locations for Desktop (Width >= 768px) to show input at top, #advanced-searchform for Mobile
    const anchor = (window.innerWidth >= 768) ? '#locations' : '#advanced-searchform';
    let targetUrl = `https://international.thailandpost.com/${anchor}`;

    // Check if country is selected
    const countrySel = document.getElementById('country');
    if (countrySel && countrySel.value) {
        // Find corresponding country object
        // value format is "id::Name"
        const selectedVal = countrySel.value;
        const countryObj = countries.find(c => c.value === selectedVal);

        if (countryObj && countryObj.iso) {
            // Use Direct Deep Link to Prohibited Items Result
            targetUrl = `https://international.thailandpost.com/result-location/?location=${countryObj.iso}`;
        }
    }

    // Load Iframe
    if (iframe.src !== targetUrl) {
        if (loading) loading.style.display = 'flex';
        iframe.src = targetUrl;

        iframe.onload = () => {
            if (loading) loading.style.display = 'none';
        };
    }
}

function closeProhibitedModal() {
    const modal = document.getElementById('prohibitedModal');
    if (modal) modal.style.display = 'none';
}

// Close when clicking outside - Extended
window.onclick = function (event) {
    const dimModal = document.getElementById('dimModal');
    const settingsModal = document.getElementById('settingsModal');
    const prohibitedModal = document.getElementById('prohibitedModal');

    if (dimModal && event.target == dimModal) dimModal.style.display = "none";
    if (settingsModal && event.target == settingsModal) settingsModal.style.display = "none";
    if (prohibitedModal && event.target == prohibitedModal) prohibitedModal.style.display = "none";
}

// --- EMS JUMBO LOGIC ---

function initJumbo() {
    const originSel = document.getElementById('jumboOrigin');
    const destSel = document.getElementById('jumboDest');

    if (!originSel || !destSel) return;

    // Clear loading
    originSel.innerHTML = '<option value="" disabled selected>เลือกต้นทาง...</option>';
    destSel.innerHTML = '<option value="" disabled selected>เลือกปลายทาง...</option>';

    // Get Provinces (Sorted)
    // Keys of emsJumboZones or emsJumboProvinceTH
    // Use emsJumboProvinceTH for Thai display
    if (typeof emsJumboProvinceTH === 'undefined') return;

    const provinces = Object.keys(emsJumboProvinceTH).sort((a, b) => {
        return emsJumboProvinceTH[a].localeCompare(emsJumboProvinceTH[b]);
    });

    provinces.forEach(engName => {
        const thName = emsJumboProvinceTH[engName];
        const val = engName; // Use English as value (matches Zone logic)
        const text = `${thName} (${engName})`;

        // Origin
        const opt1 = document.createElement('option');
        opt1.value = val;
        opt1.textContent = text;
        if (engName === 'Bangkok') opt1.selected = true; // Default Bangkok
        originSel.appendChild(opt1);

        // Dest
        const opt2 = document.createElement('option');
        opt2.value = val;
        opt2.textContent = text;
        destSel.appendChild(opt2);
    });

    // Listener for Dest Change to Auto-Fill and Validate
    destSel.addEventListener('change', () => {
        // Auto-fill Prefix
        const dest = destSel.value;
        if (dest && typeof emsJumboZipMap !== 'undefined') {
            // Find prefix for this province (Reverse Lookup)
            const prefix = Object.keys(emsJumboZipMap).find(k => emsJumboZipMap[k] === dest);
            if (prefix) {
                const zipInput = document.getElementById('jumboZipcode');
                zipInput.value = prefix; // Set 2 digits
                // Focus and move cursor to end
                zipInput.focus();
                // Optionally check immediately (it will be partial 2 chars, usually valid match)
            }
        }
        checkJumboZipMatch();
    });
}

function checkJumboZipMatch() {
    const zipInput = document.getElementById('jumboZipcode');
    const destSel = document.getElementById('jumboDest');
    const warning = document.getElementById('jumboZipWarning');
    const remoteCheckbox = document.getElementById('jumboIsRemote');

    if (!zipInput || !destSel || !warning) return;

    // 1. Auto Remote Check (Strict)
    if (remoteCheckbox) {
        if (typeof emsJumboRemoteZipcodes !== 'undefined') {
            const isRemote = emsJumboRemoteZipcodes.includes(zip);
            remoteCheckbox.checked = isRemote;

            // Disable user interaction as per request "User shouldn't choose"
            remoteCheckbox.disabled = true;
        }
    }

    if (zip.length < 2) {
        warning.style.display = 'none';
        return;
    }

    // Check Prefix validity first
    const prefix = zip.substring(0, 2); // Get first 2 digits

    if (typeof emsJumboZipMap !== 'undefined') {
        const mappedProv = emsJumboZipMap[prefix];

        if (!mappedProv) {
            // Invalid Prefix
            warning.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> รหัสไปรษณีย์ไม่ถูกต้อง (ไม่มีในระบบ)`;
            warning.style.display = 'block';
            return;
        }

        // Valid Prefix, Check Mismatch
        if (destProv && mappedProv !== destProv) {
            const thMapped = emsJumboProvinceTH[mappedProv] || mappedProv;
            const thDest = emsJumboProvinceTH[destProv] || destProv;

            warning.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> รหัสปณ. (Zip) ${prefix}xx คือ จ.${thMapped} <br> ไม่ตรงกับ จ.${thDest}`;
            warning.style.display = 'block';
        } else {
            warning.style.display = 'none';
        }
    }
}
