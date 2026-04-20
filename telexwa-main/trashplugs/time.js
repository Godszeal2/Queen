const moment = require('moment-timezone');

const GREETINGS = {
    morning: {
        text: '🌅 *Good Morning!*',
        msg: 'Wishing you a beautiful and productive morning! May your day be filled with joy and success. ☀️',
        time: '🌄 Morning (5:00 - 11:59 AM)'
    },
    afternoon: {
        text: '☀️ *Good Afternoon!*',
        msg: 'Hope your day is going great! Keep pushing forward, you\'re doing amazing! 💪',
        time: '☀️ Afternoon (12:00 - 4:59 PM)'
    },
    evening: {
        text: '🌆 *Good Evening!*',
        msg: 'Time to relax and unwind! Hope you had a wonderful day. 🌙',
        time: '🌆 Evening (5:00 - 9:59 PM)'
    }
};

let trashplug = async (m, { reply, command }) => {
    const tz = 'Africa/Lagos';
    const now = moment().tz(tz);
    const time = now.format('HH:mm:ss');
    const date = now.format('dddd, DD MMMM YYYY');
    const hour = now.hour();

    if (command === 'time') {
        return reply(`🕐 *Current Time*\n\n╭─────────────────╮\n┃ 🌍 *Timezone:* Africa/Lagos\n┃ 🕐 *Time:* ${time}\n┃ 📅 *Date:* ${date}\n╰─────────────────╯\n\n> ✨ Powered by 『 Qᴜᴇᴇɴ ᴀʙɪᴍꜱ 👑 』`);
    }

    if (command === 'date') {
        return reply(`📅 *Current Date*\n\n╭─────────────────╮\n┃ 📅 *Date:* ${date}\n┃ 🕐 *Time:* ${time}\n┃ 🌍 *Timezone:* Africa/Lagos\n╰─────────────────╯\n\n> ✨ Powered by 『 Qᴜᴇᴇɴ ᴀʙɪᴍꜱ 👑 』`);
    }

    const greeting = GREETINGS[command];
    if (greeting) {
        const currentPeriod = hour >= 5 && hour < 12 ? 'morning' : hour >= 12 && hour < 17 ? 'afternoon' : 'evening';
        const relevant = currentPeriod === command ? '✅ *That\'s correct for now!*' : `_⚠️ It\'s actually ${GREETINGS[currentPeriod].time} right now_`;
        return reply(`${greeting.text}\n\n${greeting.msg}\n\n${relevant}\n\n🕐 *Current Time:* ${time}\n\n> ✨ Powered by 『 Qᴜᴇᴇɴ ᴀʙɪᴍꜱ 👑 』`);
    }
};

trashplug.help = ['time', 'date', 'morning', 'afternoon', 'evening'];
trashplug.tags = ['general'];
trashplug.command = ['time', 'date', 'morning', 'afternoon', 'evening'];

module.exports = trashplug;
