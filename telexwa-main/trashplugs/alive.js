const os = require('os');

let trashplug = async (m, { trashcore, reply }) => {
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    const memUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);

    const statusText = `┌ ❏ *⌜ 『 Qᴜᴇᴇɴ ᴀʙɪᴍꜱ 👑 』 ⌟* ❏
│
├◆ ✅ *Bot is Alive!*
├◆ ⏱️ *Uptime:* ${hours}h ${minutes}m ${seconds}s
├◆ 💾 *RAM:* ${memUsed} MB used
├◆ 🖥️ *Platform:* ${os.platform()}
├◆ 🤖 *Status:* Online & Ready
│
└ ❏`;

    try {
        const { sendButtons } = require('gifted-btns');
        await sendButtons(trashcore, m.chat, {
            text: statusText,
            footer: '🩸 Qᴜᴇᴇɴ ᴀʙɪᴍꜱ 👑 — Bot Status',
            buttons: [
                { id: 'menu', text: '📋 View Menu' },
                { id: 'ping', text: '🏓 Ping Bot' },
                {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: '⭐ GitHub Repo',
                        url: 'https://github.com/AiOfLautech/God-s-Zeal-Xmd'
                    })
                }
            ]
        });
    } catch {
        reply(statusText);
    }
};

trashplug.help = ['alive'];
trashplug.tags = ['general'];
trashplug.command = ['alive'];

module.exports = trashplug;
