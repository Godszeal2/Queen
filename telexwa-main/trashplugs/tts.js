// API-based TTS — no gTTS package required. Streams from translate.google.com
const axios = require('axios');

const LANG_CODES = {
    en: 'en', english: 'en', fr: 'fr', french: 'fr', es: 'es', spanish: 'es',
    de: 'de', german: 'de', it: 'it', italian: 'it', pt: 'pt', portuguese: 'pt',
    ar: 'ar', arabic: 'ar', hi: 'hi', hindi: 'hi', zh: 'zh', chinese: 'zh',
    ja: 'ja', japanese: 'ja', ko: 'ko', korean: 'ko', yo: 'yo', yoruba: 'yo',
    ig: 'ig', igbo: 'ig', ha: 'ha', hausa: 'ha', sw: 'sw', swahili: 'sw',
    ru: 'ru', russian: 'ru', tr: 'tr', turkish: 'tr', nl: 'nl', dutch: 'nl'
};

function googleTtsUrl(text, lang) {
    const q = encodeURIComponent(text.slice(0, 200));
    return `https://translate.google.com/translate_tts?ie=UTF-8&q=${q}&tl=${lang}&client=tw-ob`;
}

let trashplug = async (m, { trashcore, reply, text, args }) => {
    if (!text) {
        return reply(`🔊 *Text-to-Speech*\n\nUsage: \`.tts <text>\`  or  \`.tts <lang> <text>\`\n\nLangs: en, fr, es, de, it, pt, ar, hi, yo, ig, ha, sw, zh, ja, ko, ru, tr, nl\n\nExample: \`.tts yo Ẹ káàárọ̀\``);
    }

    let lang = 'en';
    let ttsText = text;
    if (args.length >= 2) {
        const possibleLang = (args[0] || '').toLowerCase();
        if (LANG_CODES[possibleLang]) {
            lang = LANG_CODES[possibleLang];
            ttsText = args.slice(1).join(' ');
        }
    }

    if (!ttsText.trim()) return reply('❌ Provide text to convert.');

    try {
        const res = await axios.get(googleTtsUrl(ttsText, lang), {
            responseType: 'arraybuffer',
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 15000
        });
        await trashcore.sendMessage(m.chat, {
            audio: Buffer.from(res.data),
            mimetype: 'audio/mpeg',
            ptt: false
        }, { quoted: m });
    } catch (err) {
        console.error('[tts] failed:', err?.message || err);
        await reply(`❌ TTS failed. Try shorter text or another language.`);
    }
};

trashplug.help = ['tts <text>'];
trashplug.tags = ['tools'];
trashplug.command = ['tts', 'say'];

module.exports = trashplug;
