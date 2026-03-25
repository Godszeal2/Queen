let trashplug = async (m, { trashcore, reply }) => {
    const menuText = `╔══════════════════════════╗
║  🤖 *AI COMMAND MENU*      ║
╚══════════════════════════╝

┌ ❏ *⌜ CHAT AI ⌟* ❏
│
├◆ *.ai* <question>
│  └ Ask AI anything
├◆ *.ask* <question>  
│  └ Same as .ai
├◆ *.gpt* <question>
│  └ GPT-4o powered answer
│
└ ❏

┌ ❏ *⌜ IMAGE AI ⌟* ❏
│
├◆ *.imagine* <description>
│  └ Generate AI image from text
├◆ *.txt2img* <description>
│  └ Same as .imagine
├◆ *.gen* <description>
│  └ Quick image generation
├◆ *.ai2img* <description>
│  └ AI image generator
│
└ ❏

┌ ❏ *⌜ CHATBOT ⌟* ❏
│
├◆ *.chatbot on* — Enable auto-reply
├◆ *.chatbot off* — Disable auto-reply
│  (Admin/Group only)
│
└ ❏

📊 *Total AI Commands:* 8
> 🤖 Powered by GPT-4o Mini`;

    try {
        const { sendButtons } = require('gifted-btns');
        await sendButtons(trashcore, m.chat, {
            text: menuText,
            footer: '🤖 Queen Abims AI Tools',
            buttons: [
                { id: 'ai what is AI', text: '🤖 Try Chat AI' },
                { id: 'imagine beautiful sunset', text: '🎨 Try Image AI' },
                { id: 'menu', text: '📋 Back to Menu' }
            ]
        });
    } catch {
        reply(menuText);
    }
};

trashplug.help = ['aimenu'];
trashplug.tags = ['menu'];
trashplug.command = ['aimenu', 'aihelp', 'ailist'];

module.exports = trashplug;
