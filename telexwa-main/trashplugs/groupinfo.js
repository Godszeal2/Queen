let trashplug = async (m, { trashcore, reply }) => {
    if (!m.isGroup) return reply('❌ This command is for groups only.');

    try {
        const groupMetadata = await trashcore.groupMetadata(m.chat);

        let pp;
        try {
            pp = await trashcore.profilePictureUrl(m.chat, 'image');
        } catch {
            pp = null;
        }

        const participants = groupMetadata.participants;
        const groupAdmins = participants.filter(p => p.admin);
        const listAdmin = groupAdmins.map((v, i) => `${i + 1}. @${v.id.split('@')[0]}`).join('\n');
        const owner = groupMetadata.owner || groupAdmins.find(p => p.admin === 'superadmin')?.id || m.chat.split('-')[0] + '@s.whatsapp.net';

        const text = `┌──「 *INFO GROUP* 」
│
├◆ *♻️ ID:*
│  ${groupMetadata.id}
├◆ *🔖 Name:* ${groupMetadata.subject}
├◆ *👥 Members:* ${participants.length}
├◆ *🤿 Owner:* @${owner.split('@')[0]}
├◆ *🕵️ Admins (${groupAdmins.length}):*
${listAdmin}
│
├◆ *📌 Description:*
│  ${groupMetadata.desc?.toString() || 'No description'}
│
└──`;

        if (pp) {
            await trashcore.sendMessage(m.chat, {
                image: { url: pp },
                caption: text,
                mentions: [...groupAdmins.map(v => v.id), owner]
            }, { quoted: m });
        } else {
            await trashcore.sendMessage(m.chat, {
                text,
                mentions: [...groupAdmins.map(v => v.id), owner]
            }, { quoted: m });
        }
    } catch (error) {
        reply('❌ Failed to get group info.');
    }
};

trashplug.help = ['groupinfo'];
trashplug.tags = ['group'];
trashplug.command = ['groupinfo'];

module.exports = trashplug;
