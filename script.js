let clicks = 0;
let totalClicks = 0;
let gems = 0;
let pointsPerClick = 1;
let gemMultiplier = 1;
let isAutoClick = false;
let isFastClick = false;
let lastClickTime = 0;
let upgrades = {
    clicks: { cost: 10, level: 1 },
    gems: { cost: 20, level: 1 },
    speed: { cost: 15, level: 1 },
    luck: { cost: 25, level: 1 },
    power: { cost: 30, level: 1 },
    bonus: { cost: 35, level: 1 }
};
let quest = { text: '', lastUpdated: '' };
const tips = [
    'ジェムは1%の確率でドロップ！',
    'アップグレードで効率を上げよう！',
    'クエストは毎日更新！'
];

// 要素の取得
const screens = {
    loading: document.getElementById('loadingScreen'),
    home: document.getElementById('homeScreen'),
    quest: document.getElementById('questScreen'),
    upgrade: document.getElementById('upgradeScreen')
};
const clicksDisplay = document.getElementById('clicks');
const gemsDisplay = document.getElementById('gems');
const clickButton = document.getElementById('clickButton');
const autoClickButton = document.getElementById('autoClickButton');
const fastClickButton = document.getElementById('fastClickButton');
const questButton = document.getElementById('questButton');
const upgradeButton = document.getElementById('upgradeButton');
const questText = document.getElementById('questText');
const backToHomeFromQuest = document.getElementById('backToHomeFromQuest');
const backToHomeFromUpgrade = document.getElementById('backToHomeFromUpgrade');
const upgradeButtons = {
    clicks: document.getElementById('upgradeClicks'),
    gems: document.getElementById('upgradeGems'),
    speed: document.getElementById('upgradeSpeed'),
    luck: document.getElementById('upgradeLuck'),
    power: document.getElementById('upgradePower'),
    bonus: document.getElementById('upgradeBonus')
};
const upgradeCosts = {
    clicks: document.getElementById('upgradeClicksCost'),
    gems: document.getElementById('upgradeGemsCost'),
    speed: document.getElementById('upgradeSpeedCost'),
    luck: document.getElementById('upgradeLuckCost'),
    power: document.getElementById('upgradePowerCost'),
    bonus: document.getElementById('upgradeBonusCost')
};
const tipText = document.getElementById('tip');

// 画面切り替え
function showScreen(screenId) {
    Object.values(screens).forEach(screen => screen.classList.add('hidden'));
    screens[screenId].classList.remove('hidden');
}

// ロード画面
function startLoading() {
    tipText.textContent = tips[Math.floor(Math.random() * tips.length)];
    const loadBarInner = document.querySelector('.loadBarInner');
    loadBarInner.style.width = '100%';
    setTimeout(() => {
        showScreen('home');
        startAuto();
    }, 3000);
}

// データロード
function loadGame() {
    const savedData = localStorage.getItem('clickerGame');
    if (savedData) {
        const data = JSON.parse(savedData);
        clicks = data.clicks || 0;
        totalClicks = data.totalClicks || 0;
        gems = data.gems || 0;
        pointsPerClick = data.pointsPerClick || 1;
        gemMultiplier = data.gemMultiplier || 1;
        isAutoClick = data.isAutoClick || false;
        isFastClick = data.isFastClick || false;
        upgrades = data.upgrades || upgrades;
        quest = data.quest || quest;
    }
    updateQuest();
    updateUI();
}

// データ保存
function saveGame() {
    const data = {
        clicks,
        totalClicks,
        gems,
        pointsPerClick,
        gemMultiplier,
        isAutoClick,
        isFastClick,
        upgrades,
        quest
    };
    localStorage.setItem('clickerGame', JSON.stringify(data));
}

// UI更新
function updateUI() {
    clicksDisplay.textContent = Math.floor(clicks);
    gemsDisplay.textContent = Math.floor(gems);
    autoClickButton.disabled = !(gems >= 50 || totalClicks >= 1000 || isAutoClick);
    fastClickButton.disabled = !(gems >= 2000 || isFastClick);
    for (let id in upgradeButtons) {
        upgradeButtons[id].disabled = clicks < upgrades[id].cost;
        upgradeCosts[id].textContent = Math.round(upgrades[id].cost);
    }
}

// クエスト更新
function updateQuest() {
    const today = new Date().toISOString().split('T')[0];
    if (quest.lastUpdated !== today) {
        const quests = [
            '100クリック達成！報酬: 100ポイント',
            'ジェムを5個獲得！報酬: 200ポイント',
            'アップグレードを3回購入！報酬: 500ポイント'
        ];
        quest.text = quests[Math.floor(Math.random() * quests.length)];
        quest.lastUpdated = today;
        saveGame();
    }
    questText.textContent = quest.text;
}

// クリック処理
function handleClick() {
    const now = Date.now();
    const cooldown = isFastClick ? 200 : 1000;
    if (now - lastClickTime >= cooldown) {
        clicks += pointsPerClick;
        totalClicks += 1;
        if (Math.random() < 0.01) {
            gems += Math.floor(Math.random() * 10 + 1) * gemMultiplier;
        }
        lastClickTime = now;
        updateUI();
        saveGame();
    }
}

// オートクリック
function startAuto() {
    if (isAutoClick) {
        handleClick();
        setTimeout(startAuto, isFastClick ? 200 : 1000);
    }
}

// イベントリスナー
clickButton.addEventListener('click', handleClick);
autoClickButton.addEventListener('click', () => {
    if (!isAutoClick && (gems >= 50 || totalClicks >= 1000)) {
        if (gems >= 50) gems -= 50;
        isAutoClick = true;
        startAuto();
        updateUI();
        saveGame();
    }
});
fastClickButton.addEventListener('click', () => {
    if (!isFastClick && gems >= 2000) {
        gems -= 2000;
        isFastClick = true;
        updateUI();
        saveGame();
    }
});
questButton.addEventListener('click', () => showScreen('quest'));
upgradeButton.addEventListener('click', () => showScreen('upgrade'));
backToHomeFromQuest.addEventListener('click', () => showScreen('home'));
backToHomeFromUpgrade.addEventListener('click', () => showScreen('home'));
Object.entries(upgradeButtons).forEach(([id, button]) => {
    button.addEventListener('click', () => {
        if (clicks >= upgrades[id].cost) {
            clicks -= upgrades[id].cost;
            upgrades[id].cost = Math.round(upgrades[id].cost * 2.35);
            upgrades[id].level++;
            if (id === 'clicks') pointsPerClick += 1;
            if (id === 'gems') gemMultiplier += 1;
            if (id === 'speed') pointsPerClick += 0.5;
            if (id === 'luck') pointsPerClick += Math.random();
            if (id === 'power') pointsPerClick *= 1.1;
            if (id === 'bonus') clicks += Math.floor(Math.random() * 100);
            updateUI();
            saveGame();
        }
    });
});

// 初期化
loadGame();
startLoading();