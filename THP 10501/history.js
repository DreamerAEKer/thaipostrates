/**
 * Smart History Module
 * Handles saving and retrieving calculation history from localStorage.
 */

const HISTORY_KEY = 'thp_calc_history';
const MAX_HISTORY = 10;

const HistoryManager = {
    // Save a new record
    add: (record) => {
        try {
            let history = HistoryManager.getAll();

            // Add Timestamp
            record.timestamp = new Date().toISOString();
            record.id = Date.now().toString(); // Simple ID

            // Add to beginning
            history.unshift(record);

            // Cap at MAX
            if (history.length > MAX_HISTORY) {
                history = history.slice(0, MAX_HISTORY);
            }

            localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
            HistoryManager.updateUI(); // Reflect changes if UI is open
        } catch (e) {
            console.error("Failed to save history:", e);
        }
    },

    // Get all records
    getAll: () => {
        try {
            const data = localStorage.getItem(HISTORY_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },

    // Clear all
    clear: () => {
        localStorage.removeItem(HISTORY_KEY);
        HistoryManager.updateUI();
    },

    // Render list to UI
    updateUI: () => {
        const listEl = document.getElementById('historyList');
        if (!listEl) return;

        const history = HistoryManager.getAll();

        if (history.length === 0) {
            listEl.innerHTML = `<div style="text-align:center; padding:20px; color:#999;">ยังไม่มีประวัติการคำนวณ</div>`;
            return;
        }

        let html = '';
        history.forEach(item => {
            // Format Time
            const date = new Date(item.timestamp);
            const timeStr = date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
            const dateStr = date.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit' });

            // Remote Badge
            let remoteBadge = '';
            if (item.isOriginRemote || item.isDestRemote) {
                remoteBadge = `<span style="background:#ffebee; color:#c62828; font-size:0.75em; padding:1px 4px; border-radius:3px; margin-left:5px;">Remote</span>`;
            }

            html += `
                <div class="history-item" onclick="loadHistoryItem('${item.id}')">
                    <div class="history-left">
                        <div class="history-route">
                            <span class="zip-pill origin">${item.origin}</span> 
                            <i class="fa-solid fa-arrow-right" style="font-size:0.8em; color:#999;"></i> 
                            <span class="zip-pill dest">${item.dest}</span>
                            ${remoteBadge}
                        </div>
                        <div class="history-meta">
                            <span><i class="fa-solid fa-weight-hanging"></i> ${item.weight}g</span>
                            <span style="margin-left:10px; color:#666;">${dateStr} ${timeStr}</span>
                        </div>
                    </div>
                    <div class="history-right">
                         <div class="history-price">${item.price} ฿</div>
                    </div>
                </div>
            `;
        });

        listEl.innerHTML = html;
    }
};

// Global Loader Function
function loadHistoryItem(id) {
    const history = HistoryManager.getAll();
    const item = history.find(i => i.id === id);
    if (!item) return;

    // 1. Set Values
    if (document.getElementById('weight')) document.getElementById('weight').value = item.weight;
    if (document.getElementById('originZip')) document.getElementById('originZip').value = item.origin;
    if (document.getElementById('destZip')) document.getElementById('destZip').value = item.dest;

    // 2. Set Config
    const use2026 = document.getElementById('use2026Rates');
    if (use2026 && !use2026.checked) use2026.click(); // Ensure ON

    // Wait for DOM update (toggle2026Inputs)
    setTimeout(() => {
        // Set Remotes
        const originCheck = document.getElementById('isOriginRemote');
        const destCheck = document.getElementById('isDestRemote');

        // We must check if these elements are visible/available logic-wise (checkPartialZip handles visibility)
        // Ideally we assume the Zip input trigger will handle the visibility, we just need to tick.

        // Trigger Input Events to check Partial Logic
        document.getElementById('originZip').dispatchEvent(new Event('input'));
        document.getElementById('destZip').dispatchEvent(new Event('input'));

        setTimeout(() => {
            if (originCheck) originCheck.checked = item.isOriginRemote;
            if (destCheck) destCheck.checked = item.isDestRemote;

            // 3. Trigger Calc
            closeHistoryModal();
            calculateRate(null, true);
        }, 100);
    }, 50);
}

// Modal Control
function openHistoryModal() {
    const m = document.getElementById('historyModal');
    if (m) m.classList.add('show');
    HistoryManager.updateUI();
}

function closeHistoryModal() {
    const m = document.getElementById('historyModal');
    if (m) m.classList.remove('show');
}
