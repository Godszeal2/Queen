const fs = require('fs');
const path = require('path');

const CFG = path.join(__dirname, '..', 'data', 'menuConfig.json');
function load() { try { return JSON.parse(fs.readFileSync(CFG, 'utf8')); } catch { return {}; } }
function save(o) { fs.writeFileSync(CFG, JSON.stringify(o, null, 2)); }

let trashplug = async (m, { reply, text, trashcore, trashown }) => {
    if (!trashown) return reply(global.mess.owner);

    const quoted = m.quoted ? m.quoted : m;
    const mime = (quoted.msg || quoted).mimetype || '';

    let newUrl = null;

    if (text && /^https?:\/\//.test(text.trim())) {
        newUrl = text.trim();
    } else if (mime && mime.startsWith('image/')) {
        try {
            const buf = await quoted.download();
            const { uploadFile } = require('../library/scrapes/uploader');
            newUrl = await uploadFile(buf);
        } catch (e) {
            return reply(`❌ Upload failed: ${e.message}`);
        }
    } else {
        return reply(`Reply to an image OR pass a URL.\n\nUsage:\n• ${global.prefix || '.'}setmenuimg https://...\n• Reply to image with ${global.prefix || '.'}setmenuimg\n\nCurrent: ${load().menuImage || 'default'}`);
    }

    const cfg = load();
    cfg.menuImage = newUrl;
    save(cfg);

    await trashcore.sendMessage(m.chat, {
        image: { url: newUrl },
        caption: `✅ Menu image updated.\n\n${newUrl}`
    }, { quoted: m });
};

trashplug.help = ['setmenuimg [url|reply image]'];
trashplug.tags = ['owner'];
trashplug.command = ['setmenuimg', 'setmenuimage', 'setmenupic'];

module.exports = trashplug;
