const fs = require('fs');
const path = require('path');
const makeMenu = require('../library/listmenu/menulist');

function loadMenuConfig() {
    try {
        return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'menuConfig.json'), 'utf8'));
    } catch {
        return { menuImage: 'https://files.catbox.moe/s0yc4f.jpg', botName: 'Queen Abims', tagline: '' };
    }
}

let trashplug = async (m, { trashcore, reply }) => {
    const cfg = loadMenuConfig();
    const menuText = makeMenu(m.pushName || 'User');
    const caption = `${menuText}\n\n_${cfg.botName} • ${cfg.tagline || 'Hybrid Bot'}_`;

    // Per gifted-btns readme (v1.0.2): sendButtons accepts title/text/footer/image
    // and a `buttons` array. Legacy { id, text } auto-converts to quick_reply,
    // and the full { name, buttonParamsJson } shape is used for cta_url etc.
    try {
        const { sendButtons } = require('gifted-btns');
        await sendButtons(trashcore, m.chat, {
            title: cfg.botName,
            text: caption,
            footer: `${cfg.botName} • Pick a category`,
            image: { url: cfg.menuImage },
            buttons: [
                { id: 'aimenu', text: '🤖 AI Menu' },
                { id: 'downloadmenu', text: '📥 Downloads' },
                { id: 'gamemenu', text: '🎮 Games' },
                { id: 'adminmenu', text: '👥 Group Admin' },
                {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: '⭐ GitHub',
                        url: 'https://github.com/AiOfLautech/God-s-Zeal-Xmd'
                    })
                }
            ]
        });
        return;
    } catch (e) {
        console.error('[menu] sendButtons failed → image+caption fallback:', e?.message || e);
    }

    // Fallback: image + caption (no buttons)
    try {
        await trashcore.sendMessage(m.chat, {
            image: { url: cfg.menuImage },
            caption
        }, { quoted: m });
        return;
    } catch (e) {
        console.error('[menu] image fallback failed → text only:', e?.message || e);
    }

    await reply(caption);
};

trashplug.help = ['menu'];
trashplug.tags = ['menu'];
trashplug.command = ['menu', 'help'];

module.exports = trashplug;
