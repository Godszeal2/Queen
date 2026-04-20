const axios = require('axios');

const LANG_NAMES = {
    en: 'English', fr: 'French', es: 'Spanish', de: 'German',
    it: 'Italian', pt: 'Portuguese', ar: 'Arabic', hi: 'Hindi',
    zh: 'Chinese', ja: 'Japanese', ko: 'Korean', ru: 'Russian',
    yo: 'Yoruba', ig: 'Igbo', ha: 'Hausa', sw: 'Swahili',
    tr: 'Turkish', nl: 'Dutch', pl: 'Polish', vi: 'Vietnamese',
    th: 'Thai', id: 'Indonesian', ms: 'Malay', uk: 'Ukrainian'
};

let trashplug = async (m, { reply, args, text }) => {
    if (!text || args.length < 2) {
        return reply(`🌐 *Translate*\n\n*Usage:* .translate <lang> <text>\n\n*Supported:* ${Object.keys(LANG_NAMES).join(', ')}\n\n*Examples:*\n┃━ ᯬ .translate fr Hello world\n┃━ ᯬ .translate yo Good morning`);
    }

    const targetLang = args[0].toLowerCase();
    const toTranslate = args.slice(1).join(' ');

    if (!LANG_NAMES[targetLang]) {
        return reply(`❌ *Unknown language:* ${targetLang}\n\nSupported: ${Object.keys(LANG_NAMES).join(', ')}`);
    }

    try {
        await reply(`🌐 *Translating to ${LANG_NAMES[targetLang]}...*`);

        const res = await axios.get('https://api.mymemory.translated.net/get', {
            params: { q: toTranslate, langpair: `en|${targetLang}` },
            timeout: 15000
        });

        const translated = res.data?.responseData?.translatedText;

        if (!translated) return reply('❌ Translation failed. Try again.');

        await reply(`🌐 *Translation*\n\n📝 *Original:*\n${toTranslate}\n\n✅ *${LANG_NAMES[targetLang]}:*\n${translated}\n\n> 🌐 Powered by 『 Qᴜᴇᴇɴ ᴀʙɪᴍꜱ 👑 』`);

    } catch (err) {
        console.error('[TRANSLATE] Error:', err.message);
        reply(`❌ *Translation failed.*\n_Error: ${err.message}_`);
    }
};

trashplug.help = ['translate <lang> <text>'];
trashplug.tags = ['tools'];
trashplug.command = ['translate', 'tr'];

module.exports = trashplug;
