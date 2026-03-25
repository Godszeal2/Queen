let trashplug = async (m, { trashcore, reply }) => {
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const menuText = `╔══════════════════════════════╗
║  ⚡ *GENERAL COMMAND MENU*    ║
╚══════════════════════════════╝

┌ ❏ *⌜ BOT INFO ⌟* ❏
│
├◆ *.alive*
│  └ Check bot status & uptime
├◆ *.ping*
│  └ Test bot response speed
├◆ *.menu* / *.help*
│  └ Show full command menu
├◆ *.owner*
│  └ Show bot owner info
├◆ *.dev* / *.developer*
│  └ Show developer details
├◆ *.repo*
│  └ Show bot GitHub repository
├◆ *.jid*
│  └ Get your WhatsApp ID (JID)
│
└ ❏

┌ ❏ *⌜ CATEGORY MENUS ⌟* ❏
│
├◆ *.aimenu* — AI commands
├◆ *.downloadmenu* — Downloaders
├◆ *.gamemenu* — Games & fun
├◆ *.adminmenu* — Group admin
├◆ *.generalmenu* — This menu
├◆ *.ownermenu* — Owner commands
│
└ ❏

🕒 *Bot Uptime:* ${hours}h ${minutes}m ${seconds}s
📊 *Total General Commands:* 7

> ⚡ Powered by 『 Qᴜᴇᴇɴ ᴀʙɪᴍꜱ 👑 』`;

    try {
        const { sendButtons } = require('gifted-btns');
        await sendButtons(trashcore, m.chat, {
            text: menuText,
            footer: '⚡ Queen Abims General',
            buttons: [
                { id: 'alive', text: '✅ Bot Status' },
                { id: 'ping', text: '🏓 Ping' },
                { id: 'menu', text: '📋 Full Menu' }
            ]
        });
    } catch {
        reply(menuText);
    }
};

trashplug.help = ['generalmenu'];
trashplug.tags = ['menu'];
trashplug.command = ['generalmenu', 'genhelp', 'generalhelp'];

module.exports = trashplug;
