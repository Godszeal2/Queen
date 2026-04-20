let trashplug = async (m, { trashcore, reply }) => {
    try {
        const { sendButtons } = require('gifted-btns');
        await sendButtons(trashcore, m.chat, {
            text: `╭━━〔 𝗦𝗨𝗣𝗣𝗢𝗥𝗧 〕━━╮\n\n┃ Need help with the bot?\n┃ Join our support channels!\n┃\n┣ 👑 *Bot:* Qᴜᴇᴇɴ ᴀʙɪᴍꜱ\n┣ 🛠️ *Dev:* 𝙂𝙤𝙙'𝙨 𝙕𝙚𝙖𝙡 †\n\n╰━━━━━━━━━━━━━━━`,
            footer: '👑 Queen Abims Bot Support',
            buttons: [
                {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: '📢 Telegram Channel',
                        url: 'https://t.me/aitoolshub01'
                    })
                },
                {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: '💻 GitHub Repo',
                        url: 'https://github.com/AiOfLautech/God-s-Zeal-Xmd'
                    })
                },
                {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: '💬 WhatsApp Owner',
                        url: 'https://wa.me/2349074488015'
                    })
                }
            ]
        });
    } catch {
        reply(`╭━━〔 𝗦𝗨𝗣𝗣𝗢𝗥𝗧 〕━━╮\n\n┣ 📢 *Telegram:* t.me/aitoolshub01\n┣ 💻 *GitHub:* github.com/AiOfLautech/God-s-Zeal-Xmd\n┣ 💬 *Owner:* wa.me/2349074488015\n\n╰━━━━━━━━━━━━━━━\n\n> ✨ Queen Abims Bot Support`);
    }
};

trashplug.help = ['support'];
trashplug.tags = ['general'];
trashplug.command = ['support', 'botgroup', 'gcbot'];

module.exports = trashplug;
