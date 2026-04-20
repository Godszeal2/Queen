const { downloadMediaMessage, downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const webp = require('node-webpmux');
const crypto = require('crypto');

async function getTargetMessage(m) {
    if (m.quoted?.message) {
        return {
            key: {
                remoteJid: m.chat,
                id: m.quoted.key?.id || m.quoted.id,
                participant: m.quoted.key?.participant || m.quoted.sender
            },
            message: m.quoted.message
        };
    }
    return m;
}

let trashplug = async (m, { trashcore, reply }) => {
    const targetMessage = await getTargetMessage(m);
    const msg = targetMessage.message || {};
    const mediaMessage = msg.imageMessage || msg.videoMessage || msg.documentMessage ||
        m.message?.imageMessage || m.message?.videoMessage;

    if (!mediaMessage) {
        return reply('❌ *Please reply to an image or video with .sticker*\n\n_Or send an image/video with .sticker as caption._');
    }

    try {
        await reply('⏳ *Creating sticker...*');

        const mediaBuffer = await downloadMediaMessage(targetMessage, 'buffer', {}, {
            logger: undefined,
            reuploadRequest: trashcore.updateMediaMessage
        });

        if (!mediaBuffer) return reply('❌ Failed to download media. Try again.');

        const tmpDir = path.join(process.cwd(), 'tmp');
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

        const tempInput = path.join(tmpDir, `stkIn_${Date.now()}`);
        const tempOutput = path.join(tmpDir, `stkOut_${Date.now()}.webp`);

        fs.writeFileSync(tempInput, mediaBuffer);

        const isAnimated = mediaMessage.mimetype?.includes('gif') ||
            mediaMessage.mimetype?.includes('video') ||
            (mediaMessage.seconds && mediaMessage.seconds > 0);

        const ffmpegCmd = isAnimated
            ? `ffmpeg -i "${tempInput}" -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 70 "${tempOutput}"`
            : `ffmpeg -i "${tempInput}" -vf "scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -preset default -pix_fmt yuva420p -quality 75 "${tempOutput}"`;

        await new Promise((resolve, reject) => {
            exec(ffmpegCmd, (err) => err ? reject(err) : resolve());
        });

        const webpBuffer = fs.readFileSync(tempOutput);
        const img = new webp.Image();
        await img.load(webpBuffer);

        const meta = {
            'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
            'sticker-pack-name': '𝗤𝘂𝗲𝗲𝗻 𝗔𝗯𝗶𝗺𝘀 👑',
            'sticker-pack-publisher': "𝙂𝙤𝙙'𝙨 𝙕𝙚𝙖𝙡 †",
            'emojis': ['👑']
        };
        const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
        const jsonBuf = Buffer.from(JSON.stringify(meta), 'utf8');
        const exif = Buffer.concat([exifAttr, jsonBuf]);
        exif.writeUIntLE(jsonBuf.length, 14, 4);
        img.exif = exif;
        const finalBuf = await img.save(null);

        await trashcore.sendMessage(m.chat, { sticker: finalBuf }, { quoted: m });

        try { fs.unlinkSync(tempInput); } catch {}
        try { fs.unlinkSync(tempOutput); } catch {}

    } catch (err) {
        console.error('[STICKER] Error:', err);
        reply('❌ *Failed to create sticker.* Make sure you replied to an image/video.');
    }
};

trashplug.help = ['sticker'];
trashplug.tags = ['tools'];
trashplug.command = ['sticker', 's'];

module.exports = trashplug;
