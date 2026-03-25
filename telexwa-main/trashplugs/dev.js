let trashplug = async (m, { trashcore, reply }) => {
    const pushname = m.pushName || 'there';
    const devImage = 'https://jkgzqdubijffqnwcdqvp.supabase.co/storage/v1/object/public/uploads/Godszeal40.jpeg';
    const youtubeLink = 'https://youtube.com/@Godszealtech';

    const devMsg = `┌ ❏ *⌜ DEVELOPER INFORMATION ⌟* ❏
│
├◆ 👋 Hello ${pushname}!
├◆ I am *God's Zeal*, creator of this bot.
│
├◆ ─────────────────────
├◆ 🪀 *Name:* God's Zeal †
├◆ 🪀 *WhatsApp:* wa.me/2349074488015
├◆ 🪀 *YouTube:* ${youtubeLink}
│
├◆ *Bot Details:*
├◆ 📦 *Bot Name:* 『 Qᴜᴇᴇɴ ᴀʙɪᴍꜱ 👑 』
├◆ 🌐 *Version:* 2.0.0
├◆ 🛠️ *Features:* 50+ Commands
│
├◆ *Support:*
├◆ ❤️ Subscribe to my YouTube
├◆ 💬 Join my WhatsApp community
│
├◆ ✨ *Thank you for using this bot!*
└ ❏`;

    try {
        await trashcore.sendMessage(m.chat, {
            image: { url: devImage },
            caption: devMsg,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363269950668068@newsletter',
                    newsletterName: '『 Qᴜᴇᴇɴ ᴀʙɪᴍꜱ 👑 』',
                    serverMessageId: -1
                }
            }
        }, { quoted: m });
    } catch {
        reply(devMsg);
    }
};

trashplug.help = ['dev'];
trashplug.tags = ['general'];
trashplug.command = ['dev', 'developer'];

module.exports = trashplug;
