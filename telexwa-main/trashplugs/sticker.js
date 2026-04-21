// API-based sticker maker — no ffmpeg / wa-sticker-formatter / sharp / jimp.
// Uses giftedtech sticker API (image -> webp sticker). Falls back to sending the
// raw image as a sticker via Baileys' built-in webp wrapper if the API is down.
const axios = require('axios');
const FormData = require('form-data').default || require('form-data');

async function downloadQuoted(m, trashcore) {
    const target = m.quoted ? m.quoted : m;
    const msg = target.message || m.message || {};
    const media = msg.imageMessage || msg.videoMessage || msg.documentMessage;
    if (!media) return null;
    try {
        const buf = await target.download();
        if (buf) return { buffer: buf, mime: media.mimetype || '' };
    } catch {}
    return null;
}

let trashplug = async (m, { trashcore, reply }) => {
    const file = await downloadQuoted(m, trashcore);
    if (!file) return reply('❌ Reply to (or send) an image/video/gif with `.sticker`');

    await reply('⏳ Creating sticker...');

    // 1) Try sticker maker API (handles image+video+gif → webp)
    try {
        const fd = new FormData();
        const filename = file.mime.includes('video') ? 'in.mp4' : 'in.jpg';
        fd.append('file', file.buffer, filename);
        const res = await axios.post('https://api.giftedtech.web.id/api/maker/sticker?apikey=gifted', fd, {
            headers: fd.getHeaders ? fd.getHeaders() : {},
            responseType: 'arraybuffer',
            timeout: 30000
        });
        if (res.data && res.data.length > 200) {
            await trashcore.sendMessage(m.chat, { sticker: Buffer.from(res.data) }, { quoted: m });
            return;
        }
    } catch (e) {
        console.error('[sticker] api1 failed:', e?.message || e);
    }

    // 2) Direct send (Baileys auto-converts image to webp on supported builds)
    try {
        await trashcore.sendMessage(m.chat, { sticker: file.buffer }, { quoted: m });
        return;
    } catch (e) {
        console.error('[sticker] direct send failed:', e?.message || e);
    }

    await reply('❌ Sticker maker is unavailable right now. Try again shortly.');
};

trashplug.help = ['sticker'];
trashplug.tags = ['tools'];
trashplug.command = ['sticker', 's', 'stiker'];

module.exports = trashplug;
