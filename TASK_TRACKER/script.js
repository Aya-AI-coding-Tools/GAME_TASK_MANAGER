/* ========================================
   ZZZ Task Tracker - Main Application
   ======================================== */

// ========== データ定義 ==========
const TASK_DATA = {
    daily: [
        { id: 'd1', name: 'VRトレーニング', desc: '1回クリア', reward: '経験値', polychrome: 0 },
        { id: 'd2', name: 'スクラッチカード', desc: '毎日1回', reward: 'ランダム報酬', polychrome: 0 },
        { id: 'd3', name: 'コーヒー購入', desc: 'バッテリーチャージ', reward: 'バッテリー60', polychrome: 0 },
        { id: 'd4', name: 'デイリー依頼', desc: '4つ完了', reward: 'ポリクローム', polychrome: 60 },
        { id: 'd5', name: 'ビデオ屋', desc: 'レンタル確認', reward: 'マスターテープ', polychrome: 0 },
        { id: 'd6', name: 'HIA活動', desc: 'デイリーアクティビティ', reward: '経験値・素材', polychrome: 0 },
        { id: 'd7', name: 'バッテリー消費', desc: '240消費推奨', reward: '育成素材', polychrome: 0 },
        { id: 'd8', name: 'フレンドインタラクト', desc: 'エール送信', reward: 'バッテリー', polychrome: 0 }
    ],
    weekly: [
        { id: 'w1', name: 'ウィークリー依頼', desc: '全完了で報酬', reward: 'ポリクローム', polychrome: 400 },
        { id: 'w2', name: '零号ホロウ', desc: '週1回クリア推奨', reward: 'ディスク・素材', polychrome: 0 },
        { id: 'w3', name: 'ショップ更新確認', desc: '一般ショップ', reward: '各種素材', polychrome: 0 },
        { id: 'w4', name: '模擬戦闘', desc: '週間報酬獲得', reward: 'ポリクローム', polychrome: 100 },
        { id: 'w5', name: 'サンデー割引', desc: 'ショップ割引', reward: '割引購入', polychrome: 0 }
    ],
    biweekly: [
        { id: 'b1', name: '式輿防衛戦', desc: '全ステージクリア', reward: 'ポリクローム', polychrome: 800 },
        { id: 'b2', name: '式輿防衛戦ショップ', desc: '交換確認', reward: '育成素材', polychrome: 0 }
    ],
    monthly: [
        { id: 'm1', name: '絶対カード', desc: '毎月リセット', reward: 'ポリクローム', polychrome: 1680 },
        { id: 'm2', name: '第一銀行利息', desc: '毎月1日', reward: 'ディニー', polychrome: 0 },
        { id: 'm3', name: '新艾利都市民基金', desc: '課金特典', reward: 'ポリクローム', polychrome: 300 },
        { id: 'm4', name: 'HDD屋ショップ', desc: '月間更新', reward: 'ディスク', polychrome: 0 }
    ]
};

// ========== 状態管理 ==========
let state = {
    tasks: {},
    wishlist: [],
    events: [],
    battlepass: { level: 0, exp: 0 },
    polychrome: 0,
    settings: {
        versionStart: '2025-12-30',
        shiyuReset: '2026-02-07',
        notifications: true
    },
    lastReset: {
        daily: null,
        weekly: null,
        biweekly: null,
        monthly: null
    }
};

// ========== 初期化 ==========
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    initTabs();
    renderAllTasks();
    initBattlepass();
    initCountdowns();
    initWishlist();
    initEvents();
    initSettings();
    initNotifications();
    initModal();
    updatePolychromeDisplay();
    checkResets();
    updateVersionInfo();
    
    // 1分ごとにカウントダウン更新
    setInterval(updateCountdowns, 60000);
    // 1分ごとにリセットチェック
    setInterval(checkResets, 60000);
    // 通知スケジュールチェック
    scheduleNotifications();
});

// ========== ローカルストレージ ==========
function loadState() {
    const saved = localStorage.getItem('zzzTaskTracker');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            state = { ...state, ...parsed };
        } catch (e) {
            console.error('Failed to load state:', e);
        }
    }
}

function saveState() {
    localStorage.setItem('zzzTaskTracker', JSON.stringify(state));
}

// ========== タブ機能 ==========
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const tabPanels = document.querySelectorAll('.tab-panel');
            tabPanels.forEach(panel => panel.classList.remove('active'));
            
            const targetTab = document.getElementById(`${btn.dataset.tab}-tab`);
            if (targetTab) targetTab.classList.add('active');
        });
    });
}

// ========== タスクレンダリング ==========
function renderAllTasks() {
    renderTaskList('daily', TASK_DATA.daily);
    renderTaskList('weekly', TASK_DATA.weekly);
    renderTaskList('biweekly', TASK_DATA.biweekly);
    renderTaskList('monthly', TASK_DATA.monthly);
}

function renderTaskList(type, tasks) {
    const container = document.getElementById(`${type}-tasks`);
    if (!container) return;
    
    container.innerHTML = tasks.map(task => {
        const isCompleted = state.tasks[task.id] || false;
        const polychromeClass = task.polychrome > 0 ? 'polychrome' : '';
        
        return `
            <div class="task-item ${isCompleted ? 'completed' : ''}" data-id="${task.id}">
                <div class="task-checkbox"></div>
                <div class="task-info">
                    <div class="task-name">${task.name}</div>
                    <div class="task-desc">${task.desc}</div>
                </div>
                <div class="task-reward ${polychromeClass}">
                    ${task.polychrome > 0 ? `
                        <img src="https://static.wikia.nocookie.net/zenless-zone-zero/images/a/a8/Item_Polychrome.png" alt="PC">
                        ${task.polychrome}
                    ` : task.reward}
                </div>
                <button class="reward-detail-btn" data-task='${JSON.stringify(task).replace(/'/g, "&#39;")}'>ℹ</button>
            </div>
        `;
    }).join('');
    
    // イベントリスナー追加
    container.querySelectorAll('.task-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.classList.contains('reward-detail-btn')) return;
            toggleTask(item.dataset.id);
        });
    });
    
    container.querySelectorAll('.reward-detail-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const taskData = btn.dataset.task.replace(/&#39;/g, "'");
            showRewardDetail(JSON.parse(taskData));
        });
    });
}

function toggleTask(taskId) {
    state.tasks[taskId] = !state.tasks[taskId];
    recalculatePolychrome();
    saveState();
    renderAllTasks();
}

function recalculatePolychrome() {
    let total = 0;
    const allTasks = [...TASK_DATA.daily, ...TASK_DATA.weekly, ...TASK_DATA.biweekly, ...TASK_DATA.monthly];
    
    allTasks.forEach(task => {
        if (state.tasks[task.id] && task.polychrome > 0) {
            total += task.polychrome;
        }
    });
    
    state.polychrome = total;
    updatePolychromeDisplay();
}

function updatePolychromeDisplay() {
    const display = document.getElementById('polychrome-total');
    if (display) {
        display.textContent = state.polychrome.toLocaleString();
    }
}

// ========== 報酬詳細モーダル ==========
function initModal() {
    const modal = document.getElementById('reward-modal');
    const closeBtn = modal.querySelector('.modal-close');
    
    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    });
}

function showRewardDetail(task) {
    const modal = document.getElementById('reward-modal');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    
    title.textContent = task.name;
    body.innerHTML = `
        <p><strong>説明:</strong> ${task.desc}</p>
        <p><strong>報酬:</strong> ${task.reward}</p>
        ${task.polychrome > 0 ? `<p><strong>ポリクローム:</strong> ${task.polychrome}</p>` : ''}
    `;
    
    modal.classList.remove('hidden');
}

// ========== バトルパス ==========
function initBattlepass() {
    const levelInput = document.getElementById('bp-level');
    const expInput = document.getElementById('bp-exp');
    const resetBtn = document.getElementById('bp-reset-btn');
    
    levelInput.value = state.battlepass.level;
    expInput.value = state.battlepass.exp;
    updateBPGauge();
    
    levelInput.addEventListener('change', () => {
        state.battlepass.level = Math.min(60, Math.max(0, parseInt(levelInput.value) || 0));
        levelInput.value = state.battlepass.level;
        updateBPGauge();
        saveState();
    });
    
    expInput.addEventListener('change', () => {
        state.battlepass.exp = Math.min(800, Math.max(0, parseInt(expInput.value) || 0));
        expInput.value = state.battlepass.exp;
        updateBPGauge();
        saveState();
    });
    
    resetBtn.addEventListener('click', () => {
        if (confirm('バトルパスをリセットしますか？')) {
            state.battlepass = { level: 0, exp: 0 };
            levelInput.value = 0;
            expInput.value = 0;
            updateBPGauge();
            saveState();
        }
    });
}

function updateBPGauge() {
    const gauge = document.getElementById('bp-gauge');
    const totalExp = (state.battlepass.level * 800) + state.battlepass.exp;
    const maxExp = 60 * 800;
    const percentage = (totalExp / maxExp) * 100;
    gauge.style.width = `${percentage}%`;
}

// ========== カウントダウン ==========
function initCountdowns() {
    updateCountdowns();
}

function updateCountdowns() {
    const now = new Date();
    
    // ウィークリー（次の月曜5:00）
    const weeklyReset = getNextWeeklyReset();
    document.getElementById('weekly-countdown').textContent = formatCountdown(weeklyReset - now);
    
    // 隔週（式輿防衛戦）- 設定されていない場合は「----」
    const shiyuDateStr = state.settings.shiyuReset;
    if (shiyuDateStr) {
        const biweeklyReset = new Date(shiyuDateStr + 'T05:00:00');
        const biweeklyMs = biweeklyReset - now;
        if (biweeklyMs > 0) {
            document.getElementById('biweekly-countdown').textContent = formatCountdown(biweeklyMs);
        } else {
            document.getElementById('biweekly-countdown').textContent = '----';
        }
    } else {
        document.getElementById('biweekly-countdown').textContent = '----';
    }
    
    // 毎月（月末→翌月1日5:00）
    const monthlyReset = getNextMonthlyReset();
    document.getElementById('monthly-countdown').textContent = formatCountdown(monthlyReset - now);
}

function getNextWeeklyReset() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7 || 7;
    
    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + daysUntilMonday);
    nextMonday.setHours(5, 0, 0, 0);
    
    // もし今日が月曜で5時前なら今日
    if (dayOfWeek === 1 && now.getHours() < 5) {
        nextMonday.setDate(now.getDate());
    }
    
    return nextMonday;
}

function getNextMonthlyReset() {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 5, 0, 0);
    return nextMonth;
}

function formatCountdown(ms) {
    if (ms < 0) return '更新中...';
    
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
        return `${days}日 ${hours}時間`;
    } else if (hours > 0) {
        return `${hours}時間 ${minutes}分`;
    } else {
        return `${minutes}分`;
    }
}

// ========== リセットチェック ==========
function checkResets() {
    const now = new Date();
    const today = now.toDateString();
    
    // デイリーリセット（毎日5:00）
    if (now.getHours() >= 5 && state.lastReset.daily !== today) {
        resetTasks('daily');
        state.lastReset.daily = today;
        showNotificationBanner('デイリータスクがリセットされました！');
        saveState();
    }
    
    // ウィークリーリセット（月曜5:00）
    const weeklyKey = getWeekKey(now);
    if (now.getDay() === 1 && now.getHours() >= 5 && state.lastReset.weekly !== weeklyKey) {
        resetTasks('weekly');
        state.lastReset.weekly = weeklyKey;
        showNotificationBanner('ウィークリータスクがリセットされました！');
        saveState();
    }
    
    // 隔週リセット（式輿防衛戦）
    if (state.settings.shiyuReset) {
        const shiyuDate = new Date(state.settings.shiyuReset + 'T05:00:00');
        if (now >= shiyuDate && state.lastReset.biweekly !== state.settings.shiyuReset) {
            resetTasks('biweekly');
            state.lastReset.biweekly = state.settings.shiyuReset;
            // 次の隔週リセット日を14日後に設定
            const nextShiyu = new Date(shiyuDate);
            nextShiyu.setDate(nextShiyu.getDate() + 14);
            state.settings.shiyuReset = nextShiyu.toISOString().split('T')[0];
            showNotificationBanner('式輿防衛戦がリセットされました！');
            saveState();
        }
    }
    
    // 月次リセット（月初1日5:00）
    const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
    if (now.getDate() === 1 && now.getHours() >= 5 && state.lastReset.monthly !== monthKey) {
        resetTasks('monthly');
        state.lastReset.monthly = monthKey;
        showNotificationBanner('毎月タスクがリセットされました！');
        saveState();
    }
    
    // バージョンリセット（42日サイクル）
    checkVersionReset();
}

function getWeekKey(date) {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    return `${date.getFullYear()}-W${weekNumber}`;
}

function resetTasks(type) {
    const taskIds = TASK_DATA[type].map(t => t.id);
    taskIds.forEach(id => {
        state.tasks[id] = false;
    });
    recalculatePolychrome();
    renderAllTasks();
}

function checkVersionReset() {
    if (!state.settings.versionStart) return;
    
    const versionStart = new Date(state.settings.versionStart + 'T05:00:00');
    const now = new Date();
    const daysSinceStart = Math.floor((now - versionStart) / (1000 * 60 * 60 * 24));
    
    if (daysSinceStart >= 42) {
        // 新バージョン開始
        const newVersionStart = new Date(versionStart);
        newVersionStart.setDate(newVersionStart.getDate() + 42);
        state.settings.versionStart = newVersionStart.toISOString().split('T')[0];
        
        // バトルパスリセット
        state.battlepass = { level: 0, exp: 0 };
        document.getElementById('bp-level').value = 0;
        document.getElementById('bp-exp').value = 0;
        updateBPGauge();
        
        // ポリクロームリセット
        state.polychrome = 0;
        Object.keys(state.tasks).forEach(key => {
            state.tasks[key] = false;
        });
        recalculatePolychrome();
        renderAllTasks();
        
        showNotificationBanner('新バージョンが開始されました！バトルパスとポリクロームがリセットされました。');
        updateVersionInfo();
        saveState();
    }
}

function updateVersionInfo() {
    if (!state.settings.versionStart) return;
    
    const versionStart = new Date(state.settings.versionStart);
    const versionEnd = new Date(versionStart);
    versionEnd.setDate(versionEnd.getDate() + 42);
    
    const formatDate = (d) => {
        return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
    };
    
    // バージョン番号を計算（2.5から開始と仮定）
    const baseDate = new Date('2025-12-30');
    const versionDiff = Math.floor((versionStart - baseDate) / (42 * 24 * 60 * 60 * 1000));
    const majorVersion = 2;
    const minorVersion = 5 + versionDiff;
    
    document.getElementById('current-version').textContent = `Ver ${majorVersion}.${minorVersion}`;
    document.getElementById('version-period').textContent = `${formatDate(versionStart)} - ${formatDate(versionEnd)}`;
}

// ========== 通知バナー ==========
function showNotificationBanner(message) {
    const banner = document.getElementById('notification-banner');
    const text = document.getElementById('notification-text');
    
    text.textContent = message;
    banner.classList.remove('hidden');
    
    // 自動で閉じる
    setTimeout(() => {
        banner.classList.add('hidden');
    }, 5000);
}

document.getElementById('notification-close')?.addEventListener('click', () => {
    document.getElementById('notification-banner').classList.add('hidden');
});

// ========== ブラウザ通知 ==========
function initNotifications() {
    if ('Notification' in window && state.settings.notifications) {
        Notification.requestPermission();
    }
}

function scheduleNotifications() {
    // 毎分チェック
    setInterval(() => {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        
        // 22:00 通知
        if (hours === 22 && minutes === 0) {
            checkAndNotify();
        }
    }, 60000);
}

function checkAndNotify() {
    if (!state.settings.notifications) return;
    
    const now = new Date();
    const dayOfWeek = now.getDay();
    
    // デイリー未完了チェック
    const dailyIncomplete = TASK_DATA.daily.some(task => !state.tasks[task.id]);
    if (dailyIncomplete) {
        sendBrowserNotification('デイリータスク未完了', '今日のデイリータスクがまだ完了していません！');
    }
    
    // 日曜日：ウィークリー通知
    if (dayOfWeek === 0) {
        const weeklyIncomplete = TASK_DATA.weekly.some(task => !state.tasks[task.id]);
        if (weeklyIncomplete) {
            sendBrowserNotification('ウィークリータスク', '明日リセットです！ウィークリータスクを確認してください。');
        }
    }
    
    // 隔週リセット前日通知
    if (state.settings.shiyuReset) {
        const shiyuDate = new Date(state.settings.shiyuReset + 'T05:00:00');
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        if (shiyuDate.toDateString() === tomorrow.toDateString()) {
            const biweeklyIncomplete = TASK_DATA.biweekly.some(task => !state.tasks[task.id]);
            if (biweeklyIncomplete) {
                sendBrowserNotification('式輿防衛戦', '明日リセットです！式輿防衛戦を確認してください。');
            }
        }
    }
    
    // 月末通知
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    if (now.getDate() === lastDayOfMonth) {
        const monthlyIncomplete = TASK_DATA.monthly.some(task => !state.tasks[task.id]);
        if (monthlyIncomplete) {
            sendBrowserNotification('毎月タスク', '明日リセットです！毎月タスクを確認してください。');
        }
    }
}

function sendBrowserNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: body,
            icon: 'https://i.imgur.com/HUirGQ6.gif'
        });
    }
}

// ========== Wishlist ==========
function initWishlist() {
    renderWishlist();
    
    const presetSelect = document.getElementById('wishlist-preset');
    const customInput = document.getElementById('wishlist-custom');
    const addBtn = document.getElementById('add-wishlist-btn');
    
    addBtn.addEventListener('click', () => {
        const preset = presetSelect.value;
        const custom = customInput.value.trim();
        const taskName = custom || preset;
        
        if (taskName) {
            state.wishlist.push({
                id: 'wish_' + Date.now(),
                name: taskName,
                completed: false
            });
            saveState();
            renderWishlist();
            
            presetSelect.value = '';
            customInput.value = '';
        }
    });
}

function renderWishlist() {
    const container = document.getElementById('wishlist-tasks');
    const hint = document.getElementById('wishlist-hint');
    
    if (state.wishlist.length === 0) {
        hint.classList.remove('hidden');
        container.innerHTML = '';
        return;
    }
    
    hint.classList.add('hidden');
    
    container.innerHTML = state.wishlist.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
            <div class="task-checkbox"></div>
            <div class="task-info">
                <div class="task-name">${task.name}</div>
            </div>
            <button class="delete-btn" data-id="${task.id}">🗑</button>
        </div>
    `).join('');
    
    container.querySelectorAll('.task-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-btn')) return;
            toggleWishlistTask(item.dataset.id);
        });
    });
    
    container.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteWishlistTask(btn.dataset.id);
        });
    });
}

function toggleWishlistTask(taskId) {
    const task = state.wishlist.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveState();
        renderWishlist();
    }
}

function deleteWishlistTask(taskId) {
    if (confirm('このタスクを削除しますか？')) {
        state.wishlist = state.wishlist.filter(t => t.id !== taskId);
        saveState();
        renderWishlist();
    }
}

// ========== イベント ==========
function initEvents() {
    renderEvents();
    
    const nameInput = document.getElementById('event-name');
    const endInput = document.getElementById('event-end');
    const addBtn = document.getElementById('add-event-btn');
    
    addBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();
        const end = endInput.value;
        
        if (name && end) {
            state.events.push({
                id: 'event_' + Date.now(),
                name: name,
                endDate: end,
                completed: false
            });
            saveState();
            renderEvents();
            
            nameInput.value = '';
            endInput.value = '';
        }
    });
}

function renderEvents() {
    const container = document.getElementById('event-tasks');
    
    // 期限切れイベントを削除
    const now = new Date();
    state.events = state.events.filter(event => new Date(event.endDate) > now);
    saveState();
    
    if (state.events.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">手動追加されたイベントはありません</p>';
        return;
    }
    
    container.innerHTML = state.events.map(event => {
        const endDate = new Date(event.endDate);
        const remaining = formatCountdown(endDate - now);
        
        return `
            <div class="task-item ${event.completed ? 'completed' : ''}" data-id="${event.id}">
                <div class="task-checkbox"></div>
                <div class="task-info">
                    <div class="task-name">${event.name}</div>
                    <div class="task-desc">残り: ${remaining}</div>
                </div>
                <button class="delete-btn" data-id="${event.id}">🗑</button>
            </div>
        `;
    }).join('');
    
    container.querySelectorAll('.task-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-btn')) return;
            toggleEventTask(item.dataset.id);
        });
    });
    
    container.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteEventTask(btn.dataset.id);
        });
    });
}

function toggleEventTask(taskId) {
    const event = state.events.find(e => e.id === taskId);
    if (event) {
        event.completed = !event.completed;
        saveState();
        renderEvents();
    }
}

function deleteEventTask(taskId) {
    if (confirm('このイベントを削除しますか？')) {
        state.events = state.events.filter(e => e.id !== taskId);
        saveState();
        renderEvents();
    }
}

// ========== 設定 ==========
function initSettings() {
    const versionInput = document.getElementById('version-start-date');
    const shiyuInput = document.getElementById('shiyu-reset-date');
    const notifCheckbox = document.getElementById('enable-notifications');
    const testNotifBtn = document.getElementById('test-notification-btn');
    const exportBtn = document.getElementById('export-data-btn');
    const importBtn = document.getElementById('import-data-btn');
    const importFile = document.getElementById('import-file');
    const resetAllBtn = document.getElementById('reset-all-btn');
    
    // 初期値設定
    versionInput.value = state.settings.versionStart || '';
    shiyuInput.value = state.settings.shiyuReset || '';
    notifCheckbox.checked = state.settings.notifications;
    
    // バージョン開始日変更
    versionInput.addEventListener('change', () => {
        state.settings.versionStart = versionInput.value;
        updateVersionInfo();
        saveState();
    });
    
    // 式輿防衛戦リセット日変更
    shiyuInput.addEventListener('change', () => {
        state.settings.shiyuReset = shiyuInput.value;
        updateCountdowns();
        saveState();
    });
    
    // 通知設定
    notifCheckbox.addEventListener('change', () => {
        state.settings.notifications = notifCheckbox.checked;
        if (notifCheckbox.checked) {
            Notification.requestPermission();
        }
        saveState();
    });
    
    // 通知テスト
    testNotifBtn.addEventListener('click', () => {
        sendBrowserNotification('テスト通知', 'ブラウザ通知が正常に動作しています！');
        showNotificationBanner('テスト通知を送信しました！');
    });
    
    // エクスポート
    exportBtn.addEventListener('click', () => {
        const dataStr = JSON.stringify(state, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `zzz-task-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    });
    
    // インポート
    importBtn.addEventListener('click', () => {
        importFile.click();
    });
    
    importFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedState = JSON.parse(event.target.result);
                    state = { ...state, ...importedState };
                    saveState();
                    location.reload();
                } catch (err) {
                    alert('ファイルの読み込みに失敗しました。');
                }
            };
            reader.readAsText(file);
        }
    });
    
    // 全データリセット
    resetAllBtn.addEventListener('click', () => {
        if (confirm('本当に全データをリセットしますか？この操作は取り消せません。')) {
            localStorage.removeItem('zzzTaskTracker');
            location.reload();
        }
    });
}
