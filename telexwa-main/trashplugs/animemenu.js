let trashplug = async (m, { trashcore, reply }) => {
    const menuText = `╔══════════════════════════╗
║  🎌 *ANIME COMMAND MENU*   ║
╚══════════════════════════╝

┌ ❏ *⌜ ANIME IMAGES ⌟* ❏
│
├◆ *.waifu*
│  └ Get a random waifu image
├◆ *.neko*
│  └ Get a random neko image
├◆ *.anime*
│  └ Same as .waifu
│
└ ❏

📊 *Total Anime Commands:* 3

💡 *Tips:*
• Commands send random anime images
• Each call gives a different image
• Great for sharing in groups!

> 🎌 Powered by 『 Qᴜᴇᴇɴ ᴀʙɪᴍꜱ 👑 』`;

    try {
        const { sendButtons } = require('gifted-btns');
        await sendButtons(trashcore, m.chat, {
            text: menuText,
            footer: '🎌 Queen Abims Anime',
            buttons: [
                { id: 'waifu', text: '💗 Get Waifu' },
                { id: 'neko', text: '🐱 Get Neko' },
                { id: 'menu', text: '📋 Back to Menu' }
            ]
        });
    } catch {
        reply(menuText);
    }
};

trashplug.help = ['animemenu'];
trashplug.tags = ['menu'];
trashplug.command = ['animemenu', 'animehelp', 'animelist'];

module.exports = trashplug;
