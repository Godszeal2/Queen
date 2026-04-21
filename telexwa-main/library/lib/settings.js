const fs = require('fs');
const path = require('path');

const SETTINGS_PATH = path.join(__dirname, '..', '..', 'data', 'botSettings.json');

const DEFAULT_SETTINGS = {
    prefix: '.',
    layout: 'royal'
};

function loadSettings() {
    try {
        if (!fs.existsSync(SETTINGS_PATH)) {
            fs.mkdirSync(path.dirname(SETTINGS_PATH), { recursive: true });
            fs.writeFileSync(SETTINGS_PATH, JSON.stringify(DEFAULT_SETTINGS, null, 2));
            return { ...DEFAULT_SETTINGS };
        }
        const raw = fs.readFileSync(SETTINGS_PATH, 'utf8');
        const data = JSON.parse(raw || '{}');
        return { ...DEFAULT_SETTINGS, ...data };
    } catch (e) {
        console.error('[settings] load failed, using defaults:', e.message);
        return { ...DEFAULT_SETTINGS };
    }
}

function saveSettings(patch) {
    try {
        const current = loadSettings();
        const next = { ...current, ...patch };
        fs.mkdirSync(path.dirname(SETTINGS_PATH), { recursive: true });
        fs.writeFileSync(SETTINGS_PATH, JSON.stringify(next, null, 2));
        return next;
    } catch (e) {
        console.error('[settings] save failed:', e.message);
        return null;
    }
}

function getPrefix() {
    return loadSettings().prefix || '.';
}

function getLayout() {
    return loadSettings().layout || 'royal';
}

const LAYOUTS = {
    royal: {
        name: 'Royal',
        topBar: '╭━━〔 {title} 〕━━╮',
        sectionOpen: '╭━━━  *{title}*  ━━━╮',
        sectionLine: '┃━ ᯬ   {item}',
        sectionClose: '╰═══════════════════',
        bodyLine: '┣ {label} : {value}',
        bottomBar: '╰═「 ᴘᴏᴡᴇʀᴇᴅ ʙʏ {brand} 」',
        footer: '> ✨ Powered by {brand}',
        replyAccent: '👑'
    },
    classic: {
        name: 'Classic',
        topBar: '┌─〔 {title} 〕─┐',
        sectionOpen: '\n╭─[ {title} ]─╮',
        sectionLine: '│ • {item}',
        sectionClose: '╰─────────╯',
        bodyLine: '│ {label}: {value}',
        bottomBar: '└── {brand} ──┘',
        footer: '— {brand}',
        replyAccent: '✦'
    },
    neo: {
        name: 'Neo',
        topBar: '▰▰▰▰▰▰▰  {title}  ▰▰▰▰▰▰▰',
        sectionOpen: '\n◤ *{title}* ◥',
        sectionLine: '⬡ {item}',
        sectionClose: '◣◢◣◢◣◢◣◢◣◢◣◢',
        bodyLine: '◇ {label}  →  {value}',
        bottomBar: '▰▰▰  {brand}  ▰▰▰',
        footer: '⟢ {brand}',
        replyAccent: '⬢'
    },
    minimal: {
        name: 'Minimal',
        topBar: '{title}',
        sectionOpen: '\n*{title}*',
        sectionLine: '• {item}',
        sectionClose: '',
        bodyLine: '{label}: {value}',
        bottomBar: '— {brand}',
        footer: '{brand}',
        replyAccent: '›'
    },
    dark: {
        name: 'Dark',
        topBar: '▓▓▓▓▓ {title} ▓▓▓▓▓',
        sectionOpen: '\n░▒▓ *{title}* ▓▒░',
        sectionLine: '▪ {item}',
        sectionClose: '▒▒▒▒▒▒▒▒▒▒▒▒▒▒',
        bodyLine: '▪ {label}  ::  {value}',
        bottomBar: '▓▓▓▓ {brand} ▓▓▓▓',
        footer: '▪ {brand}',
        replyAccent: '▪'
    }
};

function listLayouts() {
    return Object.keys(LAYOUTS);
}

function getTheme(name) {
    return LAYOUTS[name] || LAYOUTS[DEFAULT_SETTINGS.layout];
}

function fmt(template, vars = {}) {
    return String(template).replace(/\{(\w+)\}/g, (_, k) =>
        Object.prototype.hasOwnProperty.call(vars, k) ? String(vars[k]) : ''
    );
}

module.exports = {
    loadSettings,
    saveSettings,
    getPrefix,
    getLayout,
    listLayouts,
    getTheme,
    fmt,
    LAYOUTS,
    DEFAULT_SETTINGS,
    SETTINGS_PATH
};
