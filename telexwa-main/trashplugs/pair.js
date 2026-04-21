const fs = require('fs');
const path = require('path');

let trashplug = async (m, { reply, trashcore }) => {
    let bots = [];
    try {
        const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'telegram_bots.json'), 'utf8'));
        bots = Array.isArray(data.bots) ? data.bots : [];
    } catch (e) {
        return reply('❌ Could not load bot registry.');
    }

    const lines = bots.map((b, i) =>
        `*${i + 1}.* ${b.label || b.username}\n   ↳ Region: ${b.region || 'Default'}\n   ↳ Open: ${b.link || 'https://t.me/' + b.username}`
    );
    const text = `╭━━━〔 *PAIR YOUR WHATSAPP* 〕━━━╮\n\nOpen any Telegram bot below, then send:\n\n*/connect <your_wa_number>*\n\nExample: */connect 2349074488015*\n\nThe bot will reply with a pairing code you can paste in WhatsApp → Linked Devices.\n\n${lines.join('\n\n')}\n\n╰━━━━━━━━━━━━━━━━━━━━━━━╯`;

    try {
        const { sendButtons } = require('gifted-btns');
        await sendButtons(trashcore, m.chat, {
            text,
            footer: 'Tap a bot below to open it on Telegram',
            interactiveButtons: bots.slice(0, 5).map(b => ({
                name: 'cta_url',
                buttonParamsJson: JSON.stringify({
                    display_text: `🤖 ${b.label || b.username}`,
                    url: b.link || `https://t.me/${b.username}`
                })
            }))
        });
        return;
    } catch (e) {
        // Fallback to plain text
    }
    await reply(text);
};

trashplug.help = ['pair'];
trashplug.tags = ['main'];
trashplug.command = ['pair', 'pairing', 'connect'];

module.exports = trashplug;
