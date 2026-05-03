const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const periods = ['month', 'year', '6 months', 'quarter', 'week', 'day', 'one-time'];
const colorOptions = ['#007aff', '#34c759', '#ff9500', '#ff3b30', '#af52de', '#5856d6', '#ff2d55', '#5ac8fa', '#ffcc00', '#a2845e'];
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let data = {};
let settings = {};
let modalState = { type: null, secIdx: null, itemIdx: null };

function formatMoney(amount) {
    const currency = settings.currency || 'INR';
    const value = typeof amount === 'number' ? amount : (parseFloat(amount) || 0);
    try {
        return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency,
            maximumFractionDigits: 0
        }).format(value);
    } catch {
        return Math.round(value).toLocaleString();
    }
}

// ADD YOUR DEFAULT SECTIONS HERE
const defaultSections = [
    {
        id: 'annual',
        title: 'Annual Subscriptions',
        emoji: '📅',
        color: '#007aff',
        totalPeriod: 'month',
        collapsed: false,
        excluded: false,
        items: [
            { emoji: '🛒', name: 'Shopping Membership', amount: 1499, period: 'year', included: false },
            { emoji: '📺', name: 'OTT Subscription', amount: 999, period: 'year', included: false },
            { emoji: '🎬', name: 'Movie & Entertainment', amount: 2000, period: 'year', included: false },
            { emoji: '✈️', name: 'Travel Fund', amount: 15000, period: 'year', included: false },
            { emoji: '🎁', name: 'Gifts & Occasions', amount: 5000, period: 'year', included: false },
            { emoji: '💳', name: 'Card Annual Fee', amount: 500, period: 'year', included: false },
        ]
    },
    {
        id: 'household',
        title: 'Household & Family',
        emoji: '🏡',
        color: '#34c759',
        totalPeriod: 'month',
        collapsed: false,
        excluded: false,
        items: [
            { emoji: '👨‍👩‍👧‍👦', name: 'Family Support', amount: 15000, period: 'month', included: false },
            { emoji: '💊', name: 'Medical Expenses', amount: 2000, period: 'month', included: false },
            { emoji: '🧾', name: 'Household Help', amount: 3000, period: 'month', included: false },
            { emoji: '🚨', name: 'Emergency Savings', amount: 10000, period: 'month', included: false },
        ]
    },
    {
        id: 'housing',
        title: 'Housing',
        emoji: '🏠',
        color: '#ff9500',
        totalPeriod: 'month',
        collapsed: false,
        excluded: false,
        items: [
            { emoji: '🏠', name: 'Rent / EMI', amount: 15000, period: 'month', included: false },
            { emoji: '💡', name: 'Electricity Bill', amount: 1500, period: 'month', included: false },
            { emoji: '💧', name: 'Water & Maintenance', amount: 1000, period: 'month', included: false },
            { emoji: '📶', name: 'Internet & WiFi', amount: 800, period: 'month', included: false },
        ]
    },
    {
        id: 'lifestyle',
        title: 'Lifestyle & Expenses',
        emoji: '💸',
        color: '#ff3b30',
        totalPeriod: 'month',
        collapsed: false,
        excluded: false,
        items: [
            { emoji: '🛒', name: 'Groceries', amount: 4000, period: 'month', included: false },
            { emoji: '🍔', name: 'Food Delivery', amount: 1500, period: 'month', included: false },
            { emoji: '🛍️', name: 'Shopping', amount: 2000, period: 'month', included: false },
            { emoji: '🏋️', name: 'Fitness / Gym', amount: 1000, period: 'month', included: false },
            { emoji: '🛺', name: 'Transport / Commute', amount: 1500, period: 'month', included: false },
            { emoji: '📱', name: 'Mobile Recharge', amount: 500, period: 'month', included: false },
        ]
    },
    {
        id: 'investment1',
        title: 'Investments',
        emoji: '📈',
        color: '#af52de',
        totalPeriod: 'month',
        collapsed: false,
        excluded: false,
        items: [
            { emoji: '🏦', name: 'PPF / Savings', amount: 5000, period: 'month', included: false },
            { emoji: '📊', name: 'Mutual Funds (SIP)', amount: 8000, period: 'month', included: false },
            { emoji: '📈', name: 'Stocks', amount: 5000, period: 'month', included: false },
            { emoji: '🪙', name: 'Gold Investment', amount: 2000, period: 'month', included: false },
        ]
    },
    {
        id: 'retirement',
        title: 'Retirement & Benefits',
        emoji: '🏢',
        color: '#5856d6',
        totalPeriod: 'month',
        collapsed: false,
        excluded: false,
        items: [
            { emoji: '🏦', name: 'Provident Fund', amount: 12000, period: 'month', included: false },
            { emoji: '📊', name: 'NPS Contribution', amount: 5000, period: 'month', included: false },
            { emoji: '💼', name: 'Employer Benefits', amount: 3000, period: 'month', included: false },
        ]
    },
];

function init() {
    const stored = localStorage.getItem('financeData_v10');
    if (stored) {
        data = JSON.parse(stored);
    } else {
        data = {};
    }
    const storedSettings = localStorage.getItem('financeSettings');
    if (storedSettings) {
        settings = JSON.parse(storedSettings);
    } else {
        settings = { storage: true, autoExport: false, confirm: true, currency: 'INR', showBreakdown: false };
    }
    if (!settings.currency) settings.currency = 'INR';
    if (typeof settings.showBreakdown !== 'boolean') settings.showBreakdown = false;
    ensureYearData(currentYear);
    loadTheme();
    renderYearSelector();
    renderMonthSelector();
    renderAll();
}

// ===== PWA (Service Worker) =====
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./sw.js").catch(() => {
            // If registration fails (e.g. not served over http/https), app should still work.
        });
    });
}

function loadTheme() {
    const theme = localStorage.getItem('financeTheme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcon(theme);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('financeTheme', next);
    updateThemeIcon(next);
}

function updateThemeIcon(theme) {
    const btn = document.getElementById('themeToggle');
    btn.textContent = theme === 'light' ? '🌙' : '☀️';
    btn.title = theme === 'light' ? 'Dark Mode' : 'Light Mode';
}

function ensureYearData(year) {
    if (!data[year]) {
        data[year] = {};
        for (let m = 0; m < 12; m++) {
            data[year][m] = {
                sections: JSON.parse(JSON.stringify(defaultSections)),
                salaryIncome: 126220
            };
        }
    }
}

function renderYearSelector() {
    const sel = document.getElementById('yearSelect');
    let opts = '';
    for (let y = 2025; y <= 2035; y++) {
        opts += `<option value="${y}" ${y === currentYear ? 'selected' : ''}>${y}</option>`;
    }
    sel.innerHTML = opts;
}

function renderMonthSelector() {
    const sel = document.getElementById('monthSelect');
    let opts = '';
    for (let m = 0; m < 12; m++) {
        opts += `<option value="${m}" ${m === currentMonth ? 'selected' : ''}>${months[m].substring(0, 3)}</option>`;
    }
    sel.innerHTML = opts;
}

function changeYear(year) {
    currentYear = parseInt(year);
    ensureYearData(currentYear);
    renderAll();
}

function changeMonth(month) {
    currentMonth = parseInt(month);
    renderAll();
}

function getMonthData() {
    return data[currentYear][currentMonth];
}

// ===== MODAL SYSTEM =====
function openModal(type, secIdx, itemIdx) {
    modalState = { type, secIdx, itemIdx };
    const modal = document.getElementById('editModal');
    const title = document.getElementById('modalTitle');
    const fields = document.getElementById('modalFields');

    if (type === 'section') {
        const section = secIdx !== null ? getMonthData().sections[secIdx] : null;
        title.textContent = secIdx !== null ? 'Edit Section' : 'Add New Section';
        fields.innerHTML = `
            <div class="modal-field">
                <label class="modal-label">Section Name</label>
                <input type="text" class="modal-input" id="mName" value="${section ? section.title : ''}" placeholder="e.g. Chennai Flat">
            </div>
            <div class="modal-field">
                <label class="modal-label">Emoji</label>
                <input type="text" class="modal-input" id="mEmoji" value="${section ? section.emoji : ''}" placeholder="e.g. 🏢" maxlength="2">
            </div>
            <div class="modal-field">
                <label class="modal-label">Color</label>
                <input type="text" class="modal-input" id="mColor" value="${section ? section.color : '#007aff'}" placeholder="#007aff">
                <div class="color-presets" id="mColorPresets"></div>
            </div>
        `;
        renderModalColors(section ? section.color : '#007aff');
    } else if (type === 'item') {
        const item = itemIdx !== null ? getMonthData().sections[secIdx].items[itemIdx] : null;
        title.textContent = itemIdx !== null ? 'Edit Item' : 'Add New Item';
        fields.innerHTML = `
            <div class="modal-field">
                <label class="modal-label">Item Name</label>
                <input type="text" class="modal-input" id="mItemName" value="${item ? item.name : ''}" placeholder="e.g. Rent">
            </div>
            <div class="modal-field">
                <label class="modal-label">Emoji</label>
                <input type="text" class="modal-input" id="mItemEmoji" value="${item ? item.emoji : ''}" placeholder="e.g. 🏠" maxlength="2">
            </div>
            <div class="modal-field">
                <label class="modal-label">Amount</label>
                <input type="number" class="modal-input" id="mItemAmount" value="${item ? item.amount : 0}" placeholder="0">
            </div>
            <div class="modal-field">
                <label class="modal-label">Period</label>
                <select class="modal-input" id="mItemPeriod" style="cursor:pointer;">
                    ${periods.map(p => `<option value="${p}" ${item && p === item.period ? 'selected' : ''}>${p}</option>`).join('')}
                </select>
            </div>
        `;
    }
    modal.classList.add('active');
}

function renderModalColors(selectedColor) {
    const container = document.getElementById('mColorPresets');
    if (!container) return;
    container.innerHTML = colorOptions.map(c =>
        `<div class="color-dot ${c === selectedColor ? 'selected' : ''}" style="background:${c}" onclick="selectModalColor('${c}')"></div>`
    ).join('');
}

function selectModalColor(color) {
    const input = document.getElementById('mColor');
    if (input) input.value = color;
    document.querySelectorAll('#mColorPresets .color-dot').forEach(d => {
        d.classList.toggle('selected', d.style.background === color || d.getAttribute('style').includes(color));
    });
}

function closeModal() {
    document.getElementById('editModal').classList.remove('active');
    modalState = { type: null, secIdx: null, itemIdx: null };
}

function saveModal() {
    const { type, secIdx, itemIdx } = modalState;

    if (type === 'section') {
        const name = document.getElementById('mName').value.trim();
        const emoji = document.getElementById('mEmoji').value.trim();
        let color = document.getElementById('mColor').value.trim();
        if (!name) { alert('Please enter a section name'); return; }
        if (!color.startsWith('#')) color = '#' + color;

        if (secIdx !== null) {
            const section = getMonthData().sections[secIdx];
            section.title = name;
            section.emoji = emoji || section.emoji;
            section.color = color;
        } else {
            getMonthData().sections.push({
                id: 'sec_' + Date.now(), title: name, emoji: emoji || '📁', color,
                totalPeriod: 'month', collapsed: false, items: []
            });
        }
    } else if (type === 'item') {
        const name = document.getElementById('mItemName').value.trim();
        const emoji = document.getElementById('mItemEmoji').value.trim();
        const amount = parseFloat(document.getElementById('mItemAmount').value) || 0;
        const period = document.getElementById('mItemPeriod').value;
        if (!name) { alert('Please enter an item name'); return; }

        if (itemIdx !== null) {
            const item = getMonthData().sections[secIdx].items[itemIdx];
            item.name = name;
            item.emoji = emoji || item.emoji;
            item.amount = amount;
            item.period = period;
        } else {
            getMonthData().sections[secIdx].items.push({
                emoji: emoji || '📌', name, amount, period, included: false
            });
        }
    }

    saveData();
    closeModal();
    renderAll();
}

function openSectionModal(secIdx) {
    openModal('section', secIdx !== undefined ? secIdx : null, null);
}

function openItemModal(secIdx, itemIdx) {
    openModal('item', secIdx, itemIdx !== undefined ? itemIdx : null);
}

// ===== SETTINGS =====
function openSettings() {
    document.getElementById('toggleStorage').classList.toggle('active', settings.storage);
    document.getElementById('toggleAutoExport').classList.toggle('active', settings.autoExport);
    document.getElementById('toggleConfirm').classList.toggle('active', settings.confirm);
    const breakdownToggle = document.getElementById('toggleShowBreakdown');
    if (breakdownToggle) breakdownToggle.classList.toggle('active', !!settings.showBreakdown);
    const currencySel = document.getElementById('currencySelect');
    if (currencySel) currencySel.value = settings.currency || 'INR';
    renderExcludedSectionPicker();
    document.getElementById('settingsModal').classList.add('active');
}

function closeSettings() {
    document.getElementById('settingsModal').classList.remove('active');
}

function toggleSetting(key) {
    settings[key] = !settings[key];
    document.getElementById('toggle' + key.charAt(0).toUpperCase() + key.slice(1)).classList.toggle('active', settings[key]);
    localStorage.setItem('financeSettings', JSON.stringify(settings));
}

function changeCurrency(currency) {
    settings.currency = currency;
    localStorage.setItem('financeSettings', JSON.stringify(settings));
    renderAll();
}

function renderExcludedSectionPicker(selectedIdx) {
    const sel = document.getElementById('excludedSectionSelect');
    const toggle = document.getElementById('toggleExcludedSelected');
    if (!sel || !toggle) return;

    const monthData = getMonthData();
    const idx = (selectedIdx !== undefined && selectedIdx !== null)
        ? parseInt(selectedIdx)
        : (sel.value ? parseInt(sel.value) : 0);

    sel.innerHTML = monthData.sections.map((s, i) => {
        const star = s.excluded ? ' *' : '';
        return `<option value="${i}" ${i === idx ? 'selected' : ''}>${s.emoji} ${s.title}${star}</option>`;
    }).join('');

    const current = monthData.sections[parseInt(sel.value) || 0];
    toggle.classList.toggle('active', !!current?.excluded);
}

function onExcludedSectionSelectChange(value) {
    renderExcludedSectionPicker(parseInt(value));
}

function toggleExcludedSelected() {
    const sel = document.getElementById('excludedSectionSelect');
    if (!sel) return;
    const idx = parseInt(sel.value);
    const section = getMonthData().sections[idx];
    section.excluded = !section.excluded;
    saveData();
    renderExcludedSectionPicker(idx);
    renderAll();
}

function resetAllData() {
    if (confirm('This will delete ALL your data. Are you sure?')) {
        localStorage.removeItem('financeData_v10');
        data = {};
        ensureYearData(currentYear);
        renderAll();
        closeSettings();
        alert('All data has been reset.');
    }
}

// ===== RENDER =====
function renderAll() {
    const container = document.getElementById('mainContainer');
    const monthData = getMonthData();
    container.innerHTML = '';

    const excludedFootnote = document.getElementById('excludedFootnote');
    const hasExcluded = monthData.sections.some(s => !!s.excluded);
    if (excludedFootnote) excludedFootnote.style.display = hasExcluded ? '' : 'none';

    monthData.sections.forEach((section, secIdx) => {
        const card = document.createElement('div');
        card.className = 'card';
        const isCollapsed = section.collapsed || false;
        card.innerHTML = `
            <div class="section-header" onclick="toggleCollapse(${secIdx})" ondblclick="toggleCollapse(${secIdx})">
                <div style="display:flex;align-items:center;flex:1;">
                    <span class="collapse-icon ${isCollapsed ? 'collapsed' : ''}" id="collapse-icon-${secIdx}">▼</span>
                    <div class="section-title" style="border-left-color:${section.color}">${section.emoji} ${section.title}${section.excluded ? ' <span class="excluded-star">*</span>' : ''}</div>
                </div>
                <div class="section-actions" onclick="event.stopPropagation()">
                    <button class="icon-btn" onclick="openItemModal(${secIdx})" title="Add Item">➕</button>
                    <button class="icon-btn" onclick="openSectionModal(${secIdx})" title="Edit">✏️</button>
                    <button class="icon-btn" onclick="deleteSection(${secIdx})" title="Delete">🗑️</button>
                </div>
            </div>
            <div class="section-content ${isCollapsed ? 'collapsed' : ''}" id="section-content-${secIdx}">
                <div id="section-items-${secIdx}"></div>
                <div class="total-row">
                    <span class="total-amount" id="total-${secIdx}">0</span>
                    <select class="total-period" onchange="updateTotalPeriod(${secIdx},this.value)">
                        ${periods.map(p => `<option value="${p}" ${p === section.totalPeriod ? 'selected' : ''}>${p}</option>`).join('')}
                    </select>
                </div>
            </div>
        `;
        container.appendChild(card);
        renderSectionItems(secIdx);
    });

    document.getElementById('salaryIncome').value = monthData.salaryIncome;
    calculateSummary();
    const breakdown = document.getElementById('breakdownContainer');
    const divider = document.getElementById('summaryDivider');
    if (settings.showBreakdown) {
        renderBreakdown();
        if (breakdown) breakdown.style.display = '';
        if (divider) divider.style.display = 'block';
    } else {
        if (breakdown) breakdown.innerHTML = '';
        if (breakdown) breakdown.style.display = 'none';
        if (divider) divider.style.display = 'none';
    }
}

function renderBreakdown() {
    const container = document.getElementById('breakdownContainer');
    const monthData = getMonthData();
    let html = '';

    monthData.sections.forEach(section => {
        if (section.excluded) return;
        let sectionTotal = 0;
        section.items.forEach(item => {
            if (item.included) {
                sectionTotal += toMonthly(item.amount, item.period);
            }
        });
        if (sectionTotal > 0) {
            html += `
                <div class="breakdown-item">
                    <span class="breakdown-name"><span class="emoji">${section.emoji}</span> ${section.title}</span>
                    <span class="breakdown-amount">${formatMoney(Math.round(sectionTotal))} per month</span>
                </div>
            `;
        }
    });

    container.innerHTML = html;
}

function toggleCollapse(secIdx) {
    const section = getMonthData().sections[secIdx];
    section.collapsed = !section.collapsed;
    saveData();
    const content = document.getElementById(`section-content-${secIdx}`);
    const icon = document.getElementById(`collapse-icon-${secIdx}`);
    if (section.collapsed) {
        content.classList.add('collapsed');
        icon.classList.add('collapsed');
    } else {
        content.classList.remove('collapsed');
        icon.classList.remove('collapsed');
    }
}

function renderSectionItems(secIdx) {
    const section = getMonthData().sections[secIdx];
    const el = document.getElementById(`section-items-${secIdx}`);

    el.innerHTML = section.items.map((item, idx) => `
        <div class="item ${item.included ? 'included' : ''}">
            <div class="item-left">
                <div class="checkbox ${item.included ? 'checked' : ''}" onclick="toggleIncluded(${secIdx},${idx})">
                    ${item.included ? '✓' : ''}
                </div>
                <span class="emoji">${item.emoji}</span>
                <span class="item-name">${item.name}</span>
            </div>
            <div class="item-right">
                <input type="number" class="amount-input" value="${item.amount}" 
                       onchange="updateAmount(${secIdx},${idx},this.value)">
                <select class="period-select" onchange="updatePeriod(${secIdx},${idx},this.value)">
                    ${periods.map(p => `<option value="${p}" ${p === item.period ? 'selected' : ''}>${p}</option>`).join('')}
                </select>
                <span class="delete-btn" onclick="deleteItem(${secIdx},${idx})">×</span>
            </div>
        </div>
    `).join('');

    updateSectionTotal(secIdx);
}

function updateSectionTotal(secIdx) {
    const section = getMonthData().sections[secIdx];
    let monthlyTotal = 0;
    section.items.forEach(item => {
        if (item.included) {
            monthlyTotal += toMonthly(item.amount, item.period);
        }
    });

    const period = section.totalPeriod || 'month';
    let displayTotal = monthlyTotal;
    switch (period) {
        case 'year': displayTotal = monthlyTotal * 12; break;
        case '6 months': displayTotal = monthlyTotal * 6; break;
        case 'quarter': displayTotal = monthlyTotal * 3; break;
        case 'week': displayTotal = monthlyTotal / 4.33; break;
        case 'day': displayTotal = monthlyTotal / 30; break;
        default: displayTotal = monthlyTotal;
    }

    document.getElementById(`total-${secIdx}`).innerText = formatMoney(Math.round(displayTotal));
}

function updateTotalPeriod(secIdx, period) {
    getMonthData().sections[secIdx].totalPeriod = period;
    saveData();
    updateSectionTotal(secIdx);
    calculateSummary();
}

function toMonthly(amount, period) {
    if (!amount || isNaN(amount)) return 0;
    const a = parseFloat(amount);
    switch (period) {
        case 'year': return a / 12;
        case '6 months': return a / 6;
        case 'quarter': return a / 3;
        case 'week': return a * 4.33;
        case 'day': return a * 30;
        case 'one-time': return 0;
        default: return a;
    }
}

function toggleIncluded(secIdx, idx) {
    const item = getMonthData().sections[secIdx].items[idx];
    item.included = !item.included;
    saveData();
    renderSectionItems(secIdx);
    calculateSummary();
}

function updateAmount(secIdx, idx, value) {
    getMonthData().sections[secIdx].items[idx].amount = parseFloat(value) || 0;
    saveData();
    renderSectionItems(secIdx);
    calculateSummary();
}

function updatePeriod(secIdx, idx, value) {
    getMonthData().sections[secIdx].items[idx].period = value;
    saveData();
    renderSectionItems(secIdx);
    calculateSummary();
}

function deleteItem(secIdx, idx) {
    if (settings.confirm && !confirm('Delete this item?')) return;
    getMonthData().sections[secIdx].items.splice(idx, 1);
    saveData();
    renderSectionItems(secIdx);
    calculateSummary();
}

function deleteSection(secIdx) {
    if (settings.confirm && !confirm('Delete this entire section?')) return;
    getMonthData().sections.splice(secIdx, 1);
    saveData();
    renderAll();
}

function calculateSummary() {
    const monthData = getMonthData();
    let finalTotal = 0;

    monthData.sections.forEach(section => {
        if (section.excluded) return;
        section.items.forEach(item => {
            if (item.included) {
                finalTotal += toMonthly(item.amount, item.period);
            }
        });
    });

    document.getElementById('finalTotal').innerText = formatMoney(Math.round(finalTotal));

    let salary = parseFloat(document.getElementById('salaryIncome').value) || 0;
    let leftover = salary - finalTotal;
    const loEl = document.getElementById('leftOver');
    loEl.innerText = (leftover >= 0 ? '+' : '-') + formatMoney(Math.round(Math.abs(leftover)));
    loEl.className = leftover >= 0 ? 'leftover-positive' : 'leftover-negative';
}

function saveData() {
    data[currentYear][currentMonth].salaryIncome = parseFloat(document.getElementById('salaryIncome').value) || 0;
    if (settings.storage) {
        localStorage.setItem('financeData_v10', JSON.stringify(data));
    }
    if (settings.autoExport) {
        exportData();
    }
}

function exportData() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance_backup_${currentYear}_${months[currentMonth]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function importData(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        try {
            data = JSON.parse(e.target.result);
            saveData();
            renderYearSelector();
            renderMonthSelector();
            renderAll();
            alert('Data imported successfully!');
        } catch (err) {
            alert('Invalid JSON file');
        }
    };
    reader.readAsText(file);
    input.value = '';
}

// Close modals on overlay click
document.getElementById('editModal').addEventListener('click', function (e) {
    if (e.target === this) closeModal();
});
document.getElementById('settingsModal').addEventListener('click', function (e) {
    if (e.target === this) closeSettings();
});

init();