const axios = require('axios');

const VALID_COUNTRIES = ['china', 'indonesia', 'japan', 'korea', 'hijab'];

let trashplug = async (m, { trashcore, reply, args, text }) => {
    const sub = (args[0] || text || '').toLowerCase().trim();

    if (!sub) {
        return reply(`🌸 *Pies Command*\n\n*Usage:* .pies <country>\n\n*Countries:*\n${VALID_COUNTRIES.map(c => `┃━ ᯬ .pies ${c}`).join('\n')}\n\n_Sends a random image for the selected type!_`);
    }

    if (!VALID_COUNTRIES.includes(sub)) {
        return reply(`❌ *Unknown option:* ${sub}\n\n*Available:* ${VALID_COUNTRIES.join(', ')}`);
    }

    try {
        const res = await axios.get(`https://shizoapi.onrender.com/api/pies/${sub}?apikey=shizo`, {
            responseType: 'arraybuffer',
            timeout: 20000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const contentType = res.headers['content-type'] || '';
        if (!contentType.includes('image')) throw new Error('API did not return image');

        await trashcore.sendMessage(m.chat, {
            image: Buffer.from(res.data),
            caption: `🌸 *Pies: ${sub.charAt(0).toUpperCase() + sub.slice(1)}*\n\n> 🌸 Powered by 『 Qᴜᴇᴇɴ ᴀʙɪᴍꜱ 👑 』`
        }, { quoted: m });

    } catch (err) {
        console.error('[PIES] Error:', err.message);
        reply(`❌ *Failed to fetch image for ${sub}.*\n\nAPI may be temporarily down. Try again later.`);
    }
};

trashplug.help = ['pies <country>'];
trashplug.tags = ['fun'];
trashplug.command = ['pies'];

module.exports = trashplug;
