const axios = require('axios');

const ANIME_ENDPOINTS = {
    waifu: 'https://api.princetechn.com/api/anime/waifu',
    neko: 'https://api.princetechn.com/api/anime/neko'
};

async function fetchAnimeImage(type) {
    const url = ANIME_ENDPOINTS[type] || ANIME_ENDPOINTS.waifu;
    const { data } = await axios.get(`${url}?apikey=prince`, { timeout: 15000 });
    if (!data?.success || !data?.result) throw new Error('No image returned');
    return data.result;
}

let trashplug = async (m, { command, trashcore, reply }) => {
    let type = 'waifu';
    let label = 'Waifu';

    if (command === 'neko') { type = 'neko'; label = 'Neko'; }

    await reply(`🎌 *Fetching ${label} image...*`);

    try {
        const imageUrl = await fetchAnimeImage(type);
        await trashcore.sendMessage(m.chat, {
            image: { url: imageUrl },
            caption: `🎌 *${label}!*\n\n> ✨ Powered by 『 Qᴜᴇᴇɴ ᴀʙɪᴍꜱ 👑 』`
        }, { quoted: m });
    } catch (e) {
        reply(`❌ Failed to fetch ${label} image: ${e.message}`);
    }
};

trashplug.help = ['waifu', 'neko'];
trashplug.tags = ['anime'];
trashplug.command = ['waifu', 'neko', 'anime'];

module.exports = trashplug;
