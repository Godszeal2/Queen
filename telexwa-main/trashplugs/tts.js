const gTTS = require('gtts');
const fs = require('fs');
const path = require('path');

const LANG_CODES = {
    en: 'en', english: 'en',
    fr: 'fr', french: 'fr',
    es: 'es', spanish: 'es',
    de: 'de', german: 'de',
    it: 'it', italian: 'it',
    pt: 'pt', portuguese: 'pt',
    ar: 'ar', arabic: 'ar',
    hi: 'hi', hindi: 'hi',
    zh: 'zh', chinese: 'zh',
    ja: 'ja', japanese: 'ja',
    ko: 'ko', korean: 'ko',
    yo: 'yo', yoruba: 'yo',
    ig: 'ig', igbo: 'ig',
    ha: 'ha', hausa: 'ha',
    sw: 'sw', swahili: 'sw'
};

let trashplug = async (m, { trashcore, reply, text, args }) => {
    if (!text) {
        return reply(`🔊 *Text-to-Speech (TTS)*\n\n*Usage:* .tts <text>\n_or_ .tts <lang> <text>\n\n*Supported langs:* en, fr, es, de, it, pt, ar, hi, yo, ig, ha, sw, zh, ja, ko\n\n*Examples:*\n┃━ ᯬ .tts Hello world\n┃━ ᯬ .tts yo Ẹ káàárọ̀\n┃━ ᯬ .tts fr Bonjour le monde`);
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

    if (!ttsText.trim()) return reply('❌ Please provide some text to convert.');

    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    const fileName = path.join(tmpDir, `tts_${Date.now()}.mp3`);

    try {
        await reply(`🔊 *Generating voice for:*\n_"${ttsText.substring(0, 80)}..."_`);

        await new Promise((resolve, reject) => {
            const gtts = new gTTS(ttsText, lang);
            gtts.save(fileName, (err) => err ? reject(err) : resolve());
        });

        await trashcore.sendMessage(m.chat, {
            audio: fs.readFileSync(fileName),
            mimetype: 'audio/mpeg',
            ptt: false
        }, { quoted: m });

        setTimeout(() => {
            try { if (fs.existsSync(fileName)) fs.unlinkSync(fileName); } catch {}
        }, 5000);

    } catch (err) {
        console.error('[TTS] Error:', err);
        reply(`❌ *TTS failed.* Check the text/language and try again.\n\n_Error: ${err.message}_`);
    }
};

trashplug.help = ['tts <text>'];
trashplug.tags = ['tools'];
trashplug.command = ['tts', 'say'];

module.exports = trashplug;
