const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

let trashplug = async (m, { trashcore, reply }) => {
    const quoted = m.quoted;

    if (!quoted) {
        return reply('❌ *Reply to a view-once message with .vv to reveal it!*\n\n_How to use: Reply any view-once photo/video with_ *.vv*');
    }

    const rawMsg = quoted.message || quoted;

    const voTypes = ['viewOnceMessage', 'viewOnceMessageV2', 'viewOnceMessageV2Extension'];

    let inner = null;
    for (const t of voTypes) {
        if (rawMsg?.[t]?.message) { inner = rawMsg[t].message; break; }
    }

    const imgMsg   = inner?.imageMessage || rawMsg?.imageMessage;
    const vidMsg   = inner?.videoMessage || rawMsg?.videoMessage;
    const audMsg   = inner?.audioMessage || rawMsg?.audioMessage;

    const target = imgMsg || vidMsg || audMsg;

    if (!target) {
        return reply('❌ *That is not a view-once message!*\n\n_Reply to a view-once photo, video, or audio._');
    }

    try {
        await reply('⏳ *Revealing view-once...*');

        let type = imgMsg ? 'image' : vidMsg ? 'video' : 'audio';
        const stream = await downloadContentFromMessage(target, type);
        let buffer = Buffer.alloc(0);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

        if (type === 'image') {
            await trashcore.sendMessage(m.chat, {
                image: buffer,
                caption: target.caption || '👁️ *View-once image revealed!*\n\n> ✨ Powered by 『 Qᴜᴇᴇɴ ᴀʙɪᴍꜱ 👑 』'
            }, { quoted: m });
        } else if (type === 'video') {
            await trashcore.sendMessage(m.chat, {
                video: buffer,
                caption: target.caption || '👁️ *View-once video revealed!*\n\n> ✨ Powered by 『 Qᴜᴇᴇɴ ᴀʙɪᴍꜱ 👑 』'
            }, { quoted: m });
        } else {
            await trashcore.sendMessage(m.chat, {
                audio: buffer,
                mimetype: 'audio/mp4'
            }, { quoted: m });
        }
    } catch (e) {
        console.error('[VV] Error:', e.message);
        reply('❌ *Failed to reveal view-once media.*\n\n_The media may have expired or could not be downloaded._');
    }
};

trashplug.help = ['vv'];
trashplug.tags = ['tools'];
trashplug.command = ['vv'];

module.exports = trashplug;
