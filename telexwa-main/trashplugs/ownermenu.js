let trashplug = async (m, { trashcore, reply }) => {
    const menuText = `╔══════════════════════════════╗
║  🔑 *OWNER COMMAND MENU*      ║
╚══════════════════════════════╝

┌ ❏ *⌜ BOT MODE ⌟* ❏
│
├◆ *.public*
│  └ Set bot to public mode (all users)
├◆ *.private*
│  └ Set bot to private mode (owner only)
│
└ ❏

┌ ❏ *⌜ BOT FEATURES ⌟* ❏
│
├◆ *.autoreact on* / *.autoreact off*
│  └ Toggle auto emoji reactions
│
└ ❏

┌ ❏ *⌜ ACCESS LIST ⌟* ❏
│
├◆ *.addaccess* <number>
│  └ Grant user access to the bot
├◆ *.delaccess* <number>
│  └ Revoke user access
│
└ ❏

┌ ❏ *⌜ DEVELOPER TOOLS ⌟* ❏
│
├◆ *.trash* <number>
│  └ Connect a WhatsApp number
├◆ *>* <js code>
│  └ Evaluate JavaScript
├◆ *$* <shell cmd>
│  └ Execute shell command
│
└ ❏

⚠️ *Note:* These commands are restricted to bot owner only

📊 *Total Owner Commands:* 8

> 🔑 Powered by 『 Qᴜᴇᴇɴ ᴀʙɪᴍꜱ 👑 』`;

    try {
        const { sendButtons } = require('gifted-btns');
        await sendButtons(trashcore, m.chat, {
            text: menuText,
            footer: '🔑 Queen Abims Owner Panel',
            buttons: [
                { id: 'alive', text: '✅ Bot Status' },
                { id: 'menu', text: '📋 Back to Menu' },
                {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: '⭐ GitHub',
                        url: 'https://github.com/AiOfLautech/God-s-Zeal-Xmd'
                    })
                }
            ]
        });
    } catch {
        reply(menuText);
    }
};

trashplug.help = ['ownermenu'];
trashplug.tags = ['menu'];
trashplug.command = ['ownermenu', 'ownerhelp', 'ownerlist'];

module.exports = trashplug;
