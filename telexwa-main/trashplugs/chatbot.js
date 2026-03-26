const fs = require('fs');
const path = require('path');
const axios = require('axios');

const DATA_FILE = path.join(__dirname, '../data/chatbotData.json');

function loadData() {
    try {
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch {
        return {};
    }
}

function saveData(data) {
    try {
        if (!fs.existsSync(path.dirname(DATA_FILE))) {
            fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
        }
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Chatbot data save error:', e.message);
    }
}

async function getDDGToken() {
    try {
        const res = await axios.get('https://duckduckgo.com/duckchat/v1/status', {
            headers: { 'x-vqd-accept': '1' },
            timeout: 8000
        });
        return res.headers['x-vqd-4'] || null;
    } catch {
        return null;
    }
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
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 20000,
        responseType: 'text'
    });

    const raw = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
    const lines = raw.split('\n');
    let message = '';
    for (const line of lines) {
        if (line.startsWith('data: ')) {
            const chunk = line.slice(6).trim();
            if (chunk === '[DONE]') break;
            try {
                const obj = JSON.parse(chunk);
                const delta = obj?.message;
                if (delta) message += delta;
            } catch {}
        }
    }
    return message.trim() || null;
}

const DC_CHAT_ENDPOINTS = [
    { url: 'https://apis.davidcyril.name.ng/ai/gemini', field: 'message' },
    { url: 'https://apis.davidcyril.name.ng/ai/gpt4omini', field: 'response' },
    { url: 'https://apis.davidcyril.name.ng/ai/gpt4', field: 'message' },
    { url: 'https://apis.davidcyril.name.ng/ai/llama3', field: 'message' },
    { url: 'https://apis.davidcyril.name.ng/ai/gpt3', field: 'message' }
];

async function askDavidCyrilAI(prompt) {
    for (const ep of DC_CHAT_ENDPOINTS) {
        try {
            const { data } = await axios.get(ep.url, {
                params: { text: prompt },
                timeout: 15000
            });
            if (data?.success) {
                const answer = data[ep.field] || data.message || data.response;
                if (answer && typeof answer === 'string') return answer.trim();
            }
        } catch {}
    }
    throw new Error('All David Cyril endpoints failed');
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

    throw new Error('All AI services unavailable');
}

let trashplug = async (m, { trashcore, reply, text, command }) => {
    const from = m.chat;
    const sender = m.key.participant || m.key.remoteJid;
    const botNumber = trashcore.user.id.split(':')[0] + '@s.whatsapp.net';

    if (command === 'chatbot') {
        const arg = text.toLowerCase().trim();

        const isOwner = sender.includes(trashcore.user.id.split(':')[0]);
        let isSenderAdmin = isOwner;

        if (!isOwner && from.endsWith('@g.us')) {
            try {
                const meta = await trashcore.groupMetadata(from);
                isSenderAdmin = meta.participants.some(p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin'));
            } catch {}
        }

        if (!isSenderAdmin) return reply('❌ Only admins or owner can use this command.');

        const data = loadData();

        if (arg === 'on') {
            data[from] = true;
            saveData(data);
            return reply('✅ Chatbot *enabled* for this group!\n\nMention or reply to me to chat.');
        } else if (arg === 'off') {
            delete data[from];
            saveData(data);
            return reply('✅ Chatbot *disabled* for this group.');
        } else {
            return reply('ℹ️ Usage:\n• `.chatbot on` — Enable chatbot\n• `.chatbot off` — Disable chatbot');
        }
    }

    const data = loadData();
    if (!data[from]) return;

    const isMentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.includes(botNumber);
    const isReplyToBot = m.message?.extendedTextMessage?.contextInfo?.participant === botNumber;

    if (!isMentioned && !isReplyToBot) return;

    const userMsg = (m.message?.conversation || m.message?.extendedTextMessage?.text || '')
        .replace(new RegExp(`@${botNumber.split('@')[0]}`, 'g'), '')
        .trim();

    if (!userMsg) return;

    try {
        await trashcore.sendPresenceUpdate('composing', from);
        await new Promise(r => setTimeout(r, 1500));

        const answer = await askAI(userMsg);
        await trashcore.sendMessage(from, { text: answer }, { quoted: m });
    } catch (e) {
        await trashcore.sendMessage(from, { text: "Hmm, I'm thinking... 🤔 Try again in a moment!" }, { quoted: m });
    }
};

trashplug.help = ['chatbot <on/off>'];
trashplug.tags = ['admin'];
trashplug.command = ['chatbot'];

module.exports = trashplug;
