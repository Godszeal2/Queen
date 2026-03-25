const axios = require('axios');

let trashplug = async (m, { trashcore, reply }) => {
    let userToAnalyze;

    if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
        userToAnalyze = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
    } else if (m.message?.extendedTextMessage?.contextInfo?.participant) {
        userToAnalyze = m.message.extendedTextMessage.contextInfo.participant;
    }

    if (!userToAnalyze) {
        return reply('❌ Please mention someone or reply to their message!\n\nUsage: .character @user');
    }

    try {
        let profilePic;
        try {
            profilePic = await trashcore.profilePictureUrl(userToAnalyze, 'image');
        } catch {
            profilePic = null;
        }

        const traits = [
            "Intelligent", "Creative", "Determined", "Ambitious", "Caring",
            "Charismatic", "Confident", "Empathetic", "Energetic", "Friendly",
            "Generous", "Honest", "Humorous", "Imaginative", "Independent",
            "Intuitive", "Kind", "Logical", "Loyal", "Optimistic",
            "Passionate", "Patient", "Persistent", "Reliable", "Resourceful",
            "Sincere", "Thoughtful", "Understanding", "Versatile", "Wise"
        ];

        const numTraits = Math.floor(Math.random() * 3) + 3;
        const selectedTraits = [];
        while (selectedTraits.length < numTraits) {
            const t = traits[Math.floor(Math.random() * traits.length)];
            if (!selectedTraits.includes(t)) selectedTraits.push(t);
        }

        const traitLines = selectedTraits.map(t => `├◆ ${t}: ${Math.floor(Math.random() * 41) + 60}%`).join('\n');
        const overallRating = Math.floor(Math.random() * 21) + 80;

        const text = `┌ ❏ *⌜ CHARACTER ANALYSIS ⌟* ❏
│
├◆ 👤 *User:* @${userToAnalyze.split('@')[0]}
│
├◆ ✨ *Key Traits:*
${traitLines}
│
├◆ 🎯 *Overall Rating:* ${overallRating}%
│
└ ❏

_Note: This is a fun analysis, not to be taken seriously!_`;

        if (profilePic) {
            await trashcore.sendMessage(m.chat, {
                image: { url: profilePic },
                caption: text,
                mentions: [userToAnalyze]
            }, { quoted: m });
        } else {
            reply(text);
        }
    } catch (error) {
        reply('❌ Failed to analyze character. Try again later.');
    }
};

trashplug.help = ['character @user'];
trashplug.tags = ['fun'];
trashplug.command = ['character'];

module.exports = trashplug;
