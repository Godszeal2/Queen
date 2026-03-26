let trashplug = async (m, { trashcore, reply }) => {
    const menuText = `╔══════════════════════════════╗
║  📥 *DOWNLOAD COMMAND MENU*   ║
╚══════════════════════════════╝

┌ ❏ *⌜ MUSIC DOWNLOAD ⌟* ❏
│
├◆ *.play* <song name or URL>
│  └ Download & send YouTube audio (MP3)
│  └ *Example:* .play Shape of You
│
└ ❏

┌ ❏ *⌜ VIDEO DOWNLOAD ⌟* ❏
│
├◆ *.ytmp4* <URL or search>
│  └ Download YouTube video (MP4)
│  └ *Example:* .ytmp4 https://youtu.be/...
│  └ *Or:* .ytmp4 Despacito music video
│
└ ❏

┌ ❏ *⌜ APK DOWNLOAD ⌟* ❏
│
├◆ *.apk* <app name>
│  └ Download any Android app
│  └ *Example:* .apk WhatsApp
│  └ *Example:* .apk Telegram
│
└ ❏

┌ ❏ *⌜ VIEW-ONCE TOOLS ⌟* ❏
│
├◆ *.vv* (reply view-once msg)
│  └ Reveal hidden view-once media
├◆ *.vv2* (reply view-once msg)
│  └ Reveal + send to your DM
│
└ ❏

📊 *Total Download Commands:* 5

💡 *Tips:*
• Use YouTube links for best results
• Reply to view-once messages for vv/vv2

> 📥 Powered by 『 Qᴜᴇᴇɴ ᴀʙɪᴍꜱ 👑 』`;

    try {
        const { sendButtons } = require('gifted-btns');
        await sendButtons(trashcore, m.chat, {
            text: menuText,
            footer: '📥 Queen Abims Downloader',
            buttons: [
                { id: 'play Faded Alan Walker', text: '🎵 Try Music' },
                { id: 'ytmp4 despacito', text: '🎬 Try Video' },
                { id: 'menu', text: '📋 Back to Menu' }
            ]
        });
    } catch {
        reply(menuText);
    }
};

trashplug.help = ['downloadmenu'];
trashplug.tags = ['menu'];
trashplug.command = ['downloadmenu', 'dlmenu', 'downloadhelp'];

module.exports = trashplug;
