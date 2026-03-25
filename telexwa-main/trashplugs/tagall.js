let trashplug = async (m, { trashcore, reply, text, isAdmins }) => {
    if (!m.isGroup) return reply('❌ This command is for groups only.');
    if (!isAdmins) return reply('❌ Only admins can use this command.');

    try {
        const groupMetadata = await trashcore.groupMetadata(m.chat);
        const participants = groupMetadata.participants;
        const mentions = participants.map(p => p.id);
        const tagText = text || '📢 Attention everyone!';
        const mentionList = participants.map(p => `@${p.id.split('@')[0]}`).join(' ');

        await trashcore.sendMessage(m.chat, {
            text: `${tagText}\n\n${mentionList}`,
            mentions
        }, { quoted: m });
    } catch {
        reply('❌ Failed to tag all members.');
    }
};

trashplug.help = ['tagall <message>'];
trashplug.tags = ['admin'];
trashplug.command = ['tagall', 'tag'];

module.exports = trashplug;
