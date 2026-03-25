const {
    downloadMediaMessage,
    prepareWAMessageMedia,
    generateWAMessageFromContent
} = require('@whiskeysockets/baileys');
const pino = require('pino');

let trashplug = async (m, { trashcore, reply, text }) => {
    const from = m.chat;

    if (!from.endsWith('@g.us')) return reply('❌ This command is for groups only.');

    const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage || m.message;
    if (!quoted) return reply('❌ Reply to media or type text.\n\nUsage:\n• .gcstatus (reply to image/video)\n• .gcstatus Hello Group!');

    const isImage = quoted.imageMessage;
    const isVideo = quoted.videoMessage;
    const isAudio = quoted.audioMessage;

    if (!isImage && !isVideo && !isAudio && !text) {
        return reply('❌ Reply to media or type text.\n\nUsage:\n• .gcstatus (reply to image)\n• .gcstatus Hello Group!');
    }

    await trashcore.sendMessage(from, { react: { text: '⏳', key: m.key } });

    try {
        let messagePayload = {};

        if (isImage || isVideo || isAudio) {
            const msgKey = m.message?.extendedTextMessage?.contextInfo?.stanzaId
                ? {
                    remoteJid: m.key.remoteJid,
                    id: m.message.extendedTextMessage.contextInfo.stanzaId,
                    participant: m.message.extendedTextMessage.contextInfo.participant
                }
                : m.key;

            const mediaBuffer = await downloadMediaMessage(
                { key: msgKey, message: quoted },
                'buffer',
                {},
                { logger: pino({ level: 'silent' }) }
            );

            let mediaOptions = {};
            if (isImage) mediaOptions = { image: mediaBuffer, caption: text };
            else if (isVideo) mediaOptions = { video: mediaBuffer, caption: text };
            else if (isAudio) mediaOptions = { audio: mediaBuffer, mimetype: 'audio/mp4', ptt: false };

            const preparedMedia = await prepareWAMessageMedia(
                mediaOptions,
                { upload: trashcore.waUploadToServer }
            );

            let finalMediaMsg = {};
            if (isImage) finalMediaMsg = { imageMessage: preparedMedia.imageMessage };
            else if (isVideo) finalMediaMsg = { videoMessage: preparedMedia.videoMessage };
            else if (isAudio) finalMediaMsg = { audioMessage: preparedMedia.audioMessage };

            messagePayload = { groupStatusMessageV2: { message: finalMediaMsg } };
        } else {
            const randomHex = Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0');
            messagePayload = {
                groupStatusMessageV2: {
                    message: {
                        extendedTextMessage: {
                            text,
                            backgroundArgb: 0xFF000000 + parseInt(randomHex, 16),
                            font: 2
                        }
                    }
                }
            };
        }

        const msg = generateWAMessageFromContent(from, messagePayload, { userJid: trashcore.user.id });
        await trashcore.relayMessage(from, msg.message, { messageId: msg.key.id });
        await trashcore.sendMessage(from, { react: { text: '✅', key: m.key } });
    } catch (e) {
        console.error('[GC STATUS ERROR]', e);
        reply(`❌ Error: ${e.message}`);
    }
};

trashplug.help = ['gcstatus'];
trashplug.tags = ['admin'];
trashplug.command = ['gcstatus'];

module.exports = trashplug;
