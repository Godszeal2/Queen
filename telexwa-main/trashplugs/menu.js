const fs = require('fs');
const path = require('path');
const makeMenu = require('../library/listmenu/menulist');

function loadMenuConfig() {
    try {
        const p = path.join(__dirname, '..', 'data', 'menuConfig.json');
        return JSON.parse(fs.readFileSync(p, 'utf8'));
    } catch {
        return { menuImage: 'https://files.catbox.moe/s0yc4f.jpg', botName: 'Queen Abims', tagline: '' };
    }
}

let trashplug = async (m, { trashcore, reply }) => {
    const cfg = loadMenuConfig();
    const menuText = makeMenu(m.pushName || 'User');
    const fullCaption = `${menuText}\n\n_${cfg.botName} • ${cfg.tagline || 'Hybrid Bot'}_`;

    const buttons = [
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🤖 AI Menu', id: 'aimenu' }) },
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '📥 Downloads', id: 'downloadmenu' }) },
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🎮 Games', id: 'gamemenu' }) },
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '👥 Group Admin', id: 'adminmenu' }) },
        { name: 'cta_url', buttonParamsJson: JSON.stringify({ display_text: '⭐ GitHub', url: 'https://github.com/AiOfLautech/God-s-Zeal-Xmd' }) }
    ];

    // Try gifted-btns interactive image+buttons message first.
    try {
        const { sendButtons } = require('gifted-btns');
        await sendButtons(trashcore, m.chat, {
            title: cfg.botName,
            text: fullCaption,
            footer: `${cfg.botName} • Pick a category`,
            image: { url: cfg.menuImage },
            interactiveButtons: buttons
        });
        return;
    } catch (e) {
        console.error('[menu] sendButtons failed, falling back to image+caption:', e?.message || e);
    }

    // Fallback 1: send the menu image with caption (no buttons)
    try {
        await trashcore.sendMessage(m.chat, {
            image: { url: cfg.menuImage },
            caption: fullCaption
        }, { quoted: m });
        return;
    } catch (e) {
        console.error('[menu] image fallback failed:', e?.message || e);
    }

    // Fallback 2: plain text
    await reply(fullCaption);
};

trashplug.help = ['menu'];
trashplug.tags = ['menu'];
trashplug.command = ['menu', 'help'];

module.exports = trashplug;
