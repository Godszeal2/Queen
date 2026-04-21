const fs = require('fs');
const path = require('path');

const CFG = path.join(__dirname, '..', 'data', 'menuConfig.json');

function load() {
    try { return JSON.parse(fs.readFileSync(CFG, 'utf8')); } catch { return {}; }
}
function save(o) { fs.writeFileSync(CFG, JSON.stringify(o, null, 2)); }

let trashplug = async (m, { reply, text, trashown }) => {
    if (!trashown) return reply(global.mess.owner);
    if (!text || !text.trim()) return reply(`Usage: ${global.prefix || '.'}setbotname <new name>\n\nCurrent: ${load().botName || 'unset'}`);
    const cfg = load();
    cfg.botName = text.trim();
    save(cfg);
    await reply(`✅ Bot name updated to:\n\n*${cfg.botName}*`);
};

trashplug.help = ['setbotname <name>'];
trashplug.tags = ['owner'];
trashplug.command = ['setbotname', 'setname'];

module.exports = trashplug;
