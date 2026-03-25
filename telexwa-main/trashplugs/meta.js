const axios = require('axios');

async function getDDGToken() {
    const res = await axios.get('https://duckduckgo.com/duckchat/v1/status', {
        headers: { 'x-vqd-accept': '1' },
        timeout: 8000
    });
    return res.headers['x-vqd-4'] || null;
}

async function askAI(prompt) {
    const token = await getDDGToken();
    if (!token) throw new Error('No token');
    const res = await axios.post('https://duckduckgo.com/duckchat/v1/chat', {
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }]
    }, {
        headers: {
            'x-vqd-4': token,
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        },
        timeout: 20000,
        responseType: 'text'
    });
    const raw = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
    let message = '';
    for (const line of raw.split('\n')) {
        if (!line.startsWith('data: ')) continue;
        const chunk = line.slice(6).trim();
        if (chunk === '[DONE]') break;
        try { const obj = JSON.parse(chunk); if (obj?.message) message += obj.message; } catch {}
    }
    return message.trim();
}

let trashplug = async (m, { text, trashcore, reply }) => {
    if (!text) return reply('❓ *AI Query*\n\nUsage: .ai <your question>\n\n*Example:* .ai What is Node.js?');

    try {
        await trashcore.sendPresenceUpdate('composing', m.chat);
        const answer = await askAI(text);
        if (!answer) return reply('❌ No response from AI. Try again.');
        await reply(`🤖 *AI Response*\n\n${answer}`);
    } catch (e) {
        reply(`❌ AI Error: ${e.message}\n\nPlease try again in a moment.`);
    }
};

trashplug.help = ['ai <question>'];
trashplug.tags = ['ai'];
trashplug.command = ['ai', 'ask', 'gpt'];

module.exports = trashplug;