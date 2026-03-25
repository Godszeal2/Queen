let trashplug = async (m, { trashcore, reply }) => {
    const menuText = `╔══════════════════════════╗
║  🎮 *GAME COMMAND MENU*    ║
╚══════════════════════════╝

┌ ❏ *⌜ FUN & GAMES ⌟* ❏
│
├◆ *.8ball* <question>
│  └ Ask the magic 8-ball anything
│  └ *Example:* .8ball Will I be rich?
│
├◆ *.truth*
│  └ Get a random truth question
│
├◆ *.dare*
│  └ Get a random dare challenge
│
├◆ *.flirt* [@user]
│  └ Send a flirty pickup line
│
├◆ *.character* @user
│  └ Reveal someone's anime character
│
└ ❏

┌ ❏ *⌜ RANDOM FUN ⌟* ❏
│
├◆ *.joke*
│  └ Get a random funny joke
├◆ *.quote*
│  └ Get an inspirational quote
├◆ *.fact*
│  └ Get a random interesting fact
│
└ ❏

📊 *Total Fun Commands:* 8

💡 *Tips:*
• Use .truth and .dare in groups for fun
• Tag someone with .character

> 🎮 Powered by 『 Qᴜᴇᴇɴ ᴀʙɪᴍꜱ 👑 』`;

    try {
        const { sendButtons } = require('gifted-btns');
        await sendButtons(trashcore, m.chat, {
            text: menuText,
            footer: '🎮 Queen Abims Games',
            buttons: [
                { id: '8ball Will I win today?', text: '🎱 Try 8-Ball' },
                { id: 'joke', text: '😂 Get a Joke' },
                { id: 'menu', text: '📋 Back to Menu' }
            ]
        });
    } catch {
        reply(menuText);
    }
};

trashplug.help = ['gamemenu'];
trashplug.tags = ['menu'];
trashplug.command = ['gamemenu', 'funmenu', 'gamehelp'];

module.exports = trashplug;
