const os = require('os');
const moment = require('moment-timezone');

let trashplug = async (m, { reply }) => {
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const memUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const memTotal = (os.totalmem() / 1024 / 1024 / 1024).toFixed(1);
    const now = moment().tz('Africa/Lagos').format('HH:mm:ss — DD/MM/YYYY');

    const runtimeStr = days > 0
        ? `${days}d ${hours}h ${minutes}m ${seconds}s`
        : `${hours}h ${minutes}m ${seconds}s`;

    reply(`⏱️ *Bot Runtime*\n\n╭─────────────────╮\n┃ ⏱️ *Uptime:* ${runtimeStr}\n┃ 💾 *RAM:* ${memUsed} MB / ${memTotal} GB\n┃ 🖥️ *Platform:* ${os.platform()}\n┃ 🕐 *Time:* ${now}\n╰─────────────────╯\n\n> ✨ Powered by 『 Qᴜᴇᴇɴ ᴀʙɪᴍꜱ 👑 』`);
};

trashplug.help = ['runtime'];
trashplug.tags = ['general'];
trashplug.command = ['runtime', 'uptime'];

module.exports = trashplug;
