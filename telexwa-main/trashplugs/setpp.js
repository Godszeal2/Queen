const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

let trashplug = async (m, { trashcore, reply, trashown }) => {
    if (!trashown) return reply('❌ This command is only for the bot owner!');

    const quoted = m.quoted?.message || m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const imageMessage = quoted?.imageMessage || quoted?.stickerMessage
        || m.message?.imageMessage;

    if (!imageMessage) {
        return reply('⚠️ *Usage:* .setpp\n\n_Reply to an image or sticker with .setpp to set the bot\'s profile picture._');
    }

    try {
        await reply('⏳ *Updating bot profile picture...*');

        const type = imageMessage === m.message?.imageMessage || quoted?.imageMessage ? 'image' : 'sticker';
        const stream = await downloadContentFromMessage(imageMessage, type === 'sticker' ? 'sticker' : 'image');
        let buffer = Buffer.alloc(0);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

        const tmpDir = path.join(process.cwd(), 'tmp');
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
        const imgPath = path.join(tmpDir, `pp_${Date.now()}.jpg`);
        fs.writeFileSync(imgPath, buffer);

        await trashcore.updateProfilePicture(trashcore.user.id, { url: imgPath });

        setTimeout(() => { try { fs.unlinkSync(imgPath); } catch {} }, 5000);

        await reply('✅ *Bot profile picture updated successfully!*');

    } catch (err) {
        console.error('[SETPP] Error:', err.message);
        reply(`❌ *Failed to update profile picture.*\n_Error: ${err.message}_`);
    }
};

trashplug.help = ['setpp (reply image)'];
trashplug.tags = ['owner'];
trashplug.command = ['setpp'];

module.exports = trashplug;
