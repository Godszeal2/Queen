const axios = require('axios');

const DC_BASE = 'https://apis.davidcyril.name.ng/ai';

const DC_ENDPOINTS = [
    { url: `${DC_BASE}/gemini`, field: 'message' },
    { url: `${DC_BASE}/gpt4omini`, field: 'response' },
    { url: `${DC_BASE}/gpt4`, field: 'message' },
    { url: `${DC_BASE}/llama3`, field: 'message' },
    { url: `${DC_BASE}/gpt3`, field: 'message' },
    { url: `${DC_BASE}/mixtral`, field: 'response' }
];

async function askDavidCyrilAI(prompt) {
    const errors = [];
    for (const ep of DC_ENDPOINTS) {
        try {
            const { data } = await axios.get(ep.url, {
                params: { text: prompt },
                timeout: 15000
            });
            if (data?.success) {
                const answer = data[ep.field] || data.message || data.response;
                if (answer && typeof answer === 'string') return answer.trim();
            }
        } catch (e) {
            errors.push(e.message);
        }
    }
    throw new Error('All DC endpoints failed: ' + errors.slice(0, 2).join(', '));
}

async function getDDGToken() {
    const res = await axios.get('https://duckduckgo.com/duckchat/v1/status', {
        headers: { 'x-vqd-accept': '1' },
        timeout: 8000
    });
    return res.headers['x-vqd-4'] || null;
}

async function askDuckDuckGoAI(prompt) {
    const token = await getDDGToken();
    if (!token) throw new Error('No DDG token');
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

async function askAI(prompt) {
    try {
        const ans = await askDavidCyrilAI(prompt);
        if (ans) return ans;
    } catch {}

    try {
        const ans = await askDuckDuckGoAI(prompt);
        if (ans) return ans;
    } catch {}

    throw new Error('All AI services unavailable. Please try again later.');
}

const MODEL_LABELS = {
    ai: '🤖 *Gemini AI*',
    ask: '💬 *GPT-4o Mini*',
    gpt: '🧠 *GPT-4*',
    gemini: '✨ *Gemini Pro*',
    llama: '🦙 *Llama 3*',
    mixtral: '🌀 *Mixtral AI*',
    deepseek: '🔭 *DeepSeek*'
};

let trashplug = async (m, { text, command, trashcore, reply }) => {
    if (!text) {
        return reply(`${MODEL_LABELS[command] || '🤖 *AI*'}\n\n*Usage:* .${command} <your question>\n\n*Example:* .${command} What is Node.js?\n\n_Powered by multiple AI models with automatic fallback_`);
    }

    try {
        await trashcore.sendPresenceUpdate('composing', m.chat);
        const answer = await askAI(text);
        if (!answer) return reply('❌ No response from AI. Try again.');
        await reply(`${MODEL_LABELS[command] || '🤖 *AI*'}\n\n${answer}\n\n> ✨ Powered by 『 Qᴜᴇᴇɴ ᴀʙɪᴍꜱ 👑 』`);
    } catch (e) {
        reply(`❌ *AI Error*\n\n${e.message}\n\nPlease try again in a moment.`);
    }
};

trashplug.help = ['ai <question>'];
trashplug.tags = ['ai'];
trashplug.command = ['ai', 'ask', 'gpt', 'gemini', 'llama', 'mixtral', 'deepseek'];

module.exports = trashplug;