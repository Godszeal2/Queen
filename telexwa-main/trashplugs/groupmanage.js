const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

async function getAdminStatus(trashcore, chatId, senderId) {
    try {
        const groupMetadata = await trashcore.groupMetadata(chatId);
        const participants = groupMetadata.participants;
        const botNumber = trashcore.user.id.split(':')[0] + '@s.whatsapp.net';
        const isBotAdmin = participants.some(p => p.id === botNumber && (p.admin === 'admin' || p.admin === 'superadmin'));
        const isSenderAdmin = participants.some(p => p.id === senderId && (p.admin === 'admin' || p.admin === 'superadmin'));
        return { isBotAdmin, isSenderAdmin };
    } catch {
        return { isBotAdmin: false, isSenderAdmin: false };
    }
}

let trashplug = async (m, { trashcore, reply, command, text }) => {
    if (!m.isGroup) return reply('❌ This command is for groups only.');

    const sender = m.key.participant || m.key.remoteJid;
    const { isBotAdmin, isSenderAdmin } = await getAdminStatus(trashcore, m.chat, sender);

    if (!isBotAdmin) return reply('❌ Please make me an admin first.');
    if (!isSenderAdmin) return reply('❌ Only group admins can use this command.');

    if (command === 'setgdesc') {
        if (!text) return reply('❌ Usage: .setgdesc <new description>');
        try {
            await trashcore.groupUpdateDescription(m.chat, text);
            reply('✅ Group description updated!');
        } catch {
            reply('❌ Failed to update group description.');
        }
    }

    else if (command === 'setgname') {
        if (!text) return reply('❌ Usage: .setgname <new name>');
        try {
            await trashcore.groupUpdateSubject(m.chat, text);
            reply('✅ Group name updated!');
        } catch {
            reply('❌ Failed to update group name.');
        }
    }

    else if (command === 'setgpp') {
        const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const imageMessage = quoted?.imageMessage || quoted?.stickerMessage;
        if (!imageMessage) return reply('❌ Reply to an image/sticker with .setgpp');
        try {
            const tmpDir = path.join(process.cwd(), 'tmp');
            if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

            const stream = await downloadContentFromMessage(imageMessage, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

            const imgPath = path.join(tmpDir, `gpp_${Date.now()}.jpg`);
            fs.writeFileSync(imgPath, buffer);
            await trashcore.updateProfilePicture(m.chat, { url: imgPath });
            try { fs.unlinkSync(imgPath); } catch {}
            reply('✅ Group profile photo updated!');
        } catch {
            reply('❌ Failed to update group photo.');
        }
    }
};

trashplug.help = ['setgdesc', 'setgname', 'setgpp'];
trashplug.tags = ['admin'];
trashplug.command = ['setgdesc', 'setgname', 'setgpp'];

module.exports = trashplug;
