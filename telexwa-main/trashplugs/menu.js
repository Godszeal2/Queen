const axios = require('axios');

let trashplug = async (m, { trashcore, replymenu, reply, menu }) => {
    try {
        const { sendButtons } = require('gifted-btns');
        await sendButtons(trashcore, m.chat, {
            text: menu,
            footer: '🩸 Qᴜᴇᴇɴ ᴀʙɪᴍꜱ 👑 — Type a command to get started',
            buttons: [
                { id: 'alive', text: '✅ Status' },
                { id: 'ai help', text: '🤖 AI Help' },
                {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: '⭐ GitHub',
                        url: 'https://github.com/AiOfLautech/God-s-Zeal-Xmd'
                    })
                }
            ]
        });
    } catch {
        replymenu(menu);
    }
};

trashplug.help = ['menu'];
trashplug.tags = ['menu'];
trashplug.command = ['menu', 'help'];

module.exports = trashplug;