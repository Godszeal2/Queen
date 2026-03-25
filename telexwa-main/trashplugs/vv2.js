let trashplug = async (m, { trashcore, reply }) => {
    const quoted = m.quoted;

    if (!quoted) {
        return reply('❌ *Reply to a view-once message with .vv2 to reveal it and send to your DM!*\n\n_How to use: Reply any view-once photo/video with .vv2_');
    }

    const voTypes = [
        'viewOnceMessage',
        'viewOnceMessageV2',
        'viewOnceMessageV2Extension'
    ];

    let voContent = null;

    const checkMsg = quoted?.message || quoted;

    for (const type of voTypes) {
        if (checkMsg?.[type]) {
            voContent = checkMsg[type].message;
            break;
        }
    }

    if (!voContent) {
        return reply('❌ That is not a view-once message!\n\n_Reply to a view-once photo or video._');
    }

    const senderJid = m.key.participant || m.key.remoteJid;

    try {
        await trashcore.sendMessage(m.chat, voContent, { quoted: m });

        await trashcore.sendMessage(senderJid, {
            text: `👁️ *View-Once Revealed*\n\nSomeone sent you a view-once media — here it is:\n\n_(Forwarded from ${m.chat})_`
        });
        await trashcore.sendMessage(senderJid, voContent);

        await reply('✅ *View-once media revealed & sent to your DM!*');
    } catch (e) {
        reply('❌ Failed to send to DM: ' + e.message);
    }
};

trashplug.help = ['vv2'];
trashplug.tags = ['tools'];
trashplug.command = ['vv2'];

module.exports = trashplug;
