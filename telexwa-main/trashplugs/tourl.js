const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { CatBox } = require('../library/scrapes/uploader');
const fs = require('fs');
const path = require('path');

async function getMediaFromMessage(m) {
    const rawMsg = m.quoted?.message || m.message || {};
    const types = [
        { key: 'imageMessage', type: 'image', ext: '.jpg' },
        { key: 'videoMessage', type: 'video', ext: '.mp4' },
        { key: 'audioMessage', type: 'audio', ext: '.mp3' },
        { key: 'documentMessage', type: 'document', ext: '.bin' },
        { key: 'stickerMessage', type: 'sticker', ext: '.webp' }
    ];

    for (const t of types) {
        const msg = rawMsg[t.key];
        if (msg) {
            const stream = await downloadContentFromMessage(msg, t.type);
            const chunks = [];
            for await (const chunk of stream) chunks.push(chunk);
            const ext = t.key === 'documentMessage' ? (path.extname(msg.fileName || '') || '.bin') : t.ext;
            return { buffer: Buffer.concat(chunks), ext };
        }
    }
    return null;
}

let trashplug = async (m, { reply }) => {
    const media = await getMediaFromMessage(m).catch(() => null);

    if (!media) {
        return reply('❌ *Reply to any media with .tourl to get a direct URL.*\n\n_Supports: images, videos, audio, documents, stickers_');
    }

    try {
        await reply('⏳ *Uploading media to get URL...*');

        const tmpDir = path.join(process.cwd(), 'tmp');
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
        const tmpPath = path.join(tmpDir, `url_${Date.now()}${media.ext}`);
        fs.writeFileSync(tmpPath, media.buffer);

        const url = await CatBox(tmpPath);

        setTimeout(() => { try { fs.unlinkSync(tmpPath); } catch {} }, 5000);

        if (!url || url.includes('error')) {
            return reply('❌ Failed to upload media. Try again later.');
        }

        await reply(`🔗 *Media URL*\n\n${url}\n\n_This link is permanent and can be shared anywhere!_\n\n> ✨ Powered by 『 Qᴜᴇᴇɴ ᴀʙɪᴍꜱ 👑 』`);

    } catch (err) {
        console.error('[TOURL] Error:', err.message);
        reply(`❌ *Upload failed.*\n_Error: ${err.message}_`);
    }
};

trashplug.help = ['tourl (reply media)'];
trashplug.tags = ['tools'];
trashplug.command = ['tourl', 'url'];

module.exports = trashplug;
