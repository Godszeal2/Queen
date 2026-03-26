let trashplug = async (m, { trashcore, reply }) => {
    const menuText = `╔══════════════════════════╗
║  🤖 *AI COMMAND MENU*      ║
╚══════════════════════════╝

┌ ❏ *⌜ CHAT AI ⌟* ❏
│
├◆ *.ai* <question>
│  └ Ask AI (Gemini model)
├◆ *.ask* <question>  
│  └ Ask AI (GPT-4o-Mini)
├◆ *.gpt* <question>
│  └ GPT-4 powered answer
├◆ *.gemini* <question>
│  └ Google Gemini AI
├◆ *.llama* <question>
│  └ Meta Llama 3 AI
├◆ *.mixtral* <question>
│  └ Mixtral AI model
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

📊 *Total AI Commands:* 12
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
