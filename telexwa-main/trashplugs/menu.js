const makeMenu = require('../library/listmenu/menulist');

let trashplug = async (m, { trashcore, replymenu, reply }) => {
    const menuText = makeMenu(m.pushName || 'User');

    const buttons = [
        { id: 'aimenu', text: '🤖 AI Commands' },
        { id: 'downloadmenu', text: '📥 Downloads' },
        { id: 'gamemenu', text: '🎮 Games & Fun' },
        { id: 'adminmenu', text: '👥 Group Admin' },
        { id: 'alive', text: '✅ Bot Status' },
        {
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
                display_text: '⭐ GitHub Repo',
                url: 'https://github.com/AiOfLautech/God-s-Zeal-Xmd'
            })
        }
    ];

    try {
        const { sendButtons } = require('gifted-btns');
        await sendButtons(trashcore, m.chat, {
            text: menuText,
            footer: '👑 Queen Abims Bot v1 — Pick a category!',
            buttons
        });
    } catch {
        await reply(menuText);
    }
};

trashplug.help = ['menu'];
trashplug.tags = ['menu'];
trashplug.command = ['menu', 'help'];

module.exports = trashplug;
