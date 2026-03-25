let trashplug = async (m, { trashcore, reply }) => {
    const quoted = m.quoted;

    if (!quoted) {
        return reply('❌ *Reply to a view-once message with .vv to reveal it!*\n\n_How to use: Reply any view-once photo/video with .vv_');
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

    try {
        await trashcore.sendMessage(m.chat, voContent, { quoted: m });
        await reply('✅ *View-once media revealed!*');
    } catch (e) {
        reply('❌ Failed to reveal the media: ' + e.message);
    }
};

trashplug.help = ['vv'];
trashplug.tags = ['tools'];
trashplug.command = ['vv'];

module.exports = trashplug;
