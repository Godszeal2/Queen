let trashplug = async (m, { trashcore, reply }) => {
    const menuText = `╔══════════════════════════════╗
║  👑 *GROUP ADMIN MENU*        ║
╚══════════════════════════════╝

┌ ❏ *⌜ GROUP MANAGEMENT ⌟* ❏
│
├◆ *.tagall* [message]
│  └ Mention all group members
├◆ *.groupinfo*
│  └ Show group details & stats
├◆ *.gcstatus* <text|reply img>
│  └ Update group status/bio
├◆ *.setgname* <name>
│  └ Change the group name
├◆ *.setgdesc* <description>
│  └ Change the group description
├◆ *.setgpp* (reply to image)
│  └ Set the group profile picture
│
└ ❏

┌ ❏ *⌜ CHATBOT CONTROL ⌟* ❏
│
├◆ *.chatbot on*
│  └ Enable AI auto-reply in group
├◆ *.chatbot off*
│  └ Disable AI auto-reply
│
└ ❏

┌ ❏ *⌜ ACCESS CONTROL ⌟* ❏
│
├◆ *.addaccess* <number>
│  └ Add number to bot access list
├◆ *.delaccess* <number>
│  └ Remove from access list
│
└ ❏

⚠️ *Note:* Most commands require Bot to be Group Admin

📊 *Total Admin Commands:* 10

> 👑 Powered by 『 Qᴜᴇᴇɴ ᴀʙɪᴍꜱ 👑 』`;

    try {
        const { sendButtons } = require('gifted-btns');
        await sendButtons(trashcore, m.chat, {
            text: menuText,
            footer: '👑 Queen Abims Admin Tools',
            buttons: [
                { id: 'groupinfo', text: '📊 Group Info' },
                { id: 'tagall Check menu!', text: '📣 Tag All' },
                { id: 'menu', text: '📋 Back to Menu' }
            ]
        });
    } catch {
        reply(menuText);
    }
};

trashplug.help = ['adminmenu'];
trashplug.tags = ['menu'];
trashplug.command = ['adminmenu', 'groupmenu', 'adminhelp'];

module.exports = trashplug;
