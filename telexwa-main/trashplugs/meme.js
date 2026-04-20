const axios = require('axios');

const MEME_ENDPOINTS = [
    { url: 'https://shizoapi.onrender.com/api/memes/cheems?apikey=shizo', name: 'Cheems' },
    { url: 'https://shizoapi.onrender.com/api/memes/drake?apikey=shizo', name: 'Drake' },
    { url: 'https://shizoapi.onrender.com/api/memes/doge?apikey=shizo', name: 'Doge' }
];

let trashplug = async (m, { trashcore, reply, text }) => {
    const subCmd = (text || '').toLowerCase().trim();
    let endpoint = MEME_ENDPOINTS[Math.floor(Math.random() * MEME_ENDPOINTS.length)];

    if (subCmd === 'cheems') endpoint = MEME_ENDPOINTS[0];
    else if (subCmd === 'drake') endpoint = MEME_ENDPOINTS[1];
    else if (subCmd === 'doge') endpoint = MEME_ENDPOINTS[2];

    try {
        await reply('😂 *Fetching meme...*');

        const res = await axios.get(endpoint.url, {
            responseType: 'arraybuffer',
            timeout: 20000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const contentType = res.headers['content-type'] || '';
        if (!contentType.includes('image')) {
            throw new Error('API did not return an image');
        }

        await trashcore.sendMessage(m.chat, {
            image: Buffer.from(res.data),
            caption: `😂 *${endpoint.name} Meme!*\n\n_Type .meme for a random meme_\n_Options: .meme cheems | .meme drake | .meme doge_\n\n> 😂 Powered by 『 Qᴜᴇᴇɴ ᴀʙɪᴍꜱ 👑 』`
        }, { quoted: m });

    } catch (err) {
        console.error('[MEME] Error:', err.message);
        reply('❌ *Failed to fetch meme.* Try again later!');
    }
};

trashplug.help = ['meme'];
trashplug.tags = ['fun'];
trashplug.command = ['meme'];

module.exports = trashplug;
