let trashplug = async (m, { trashcore, replymenu, reply, menu }) => {
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
            text: menu,
            footer: '👑 Queen Abims Bot — Pick a category to explore!',
            buttons
        });
    } catch {
        replymenu(menu);
    }
};

trashplug.help = ['menu'];
trashplug.tags = ['menu'];
trashplug.command = ['menu', 'help'];

module.exports = trashplug;