const botSettings = require('../library/lib/settings');

let trashplug = async (m, { reply, text, trashown, prefix }) => {
    if (!trashown) return reply('👑 Owner only.');

    const newPrefix = (text || '').trim().split(/\s+/)[0];
    if (!newPrefix) {
        const current = botSettings.getPrefix();
        return reply(`╭─〔 *PREFIX* 〕─╮
│ Current: *[ ${current} ]*
│
│ Usage: \`${prefix}setprefix <new>\`
│ Example: \`${prefix}setprefix !\`
│ Example: \`${prefix}setprefix .\`
╰────────────╯`);
    }

    if (newPrefix.length > 3) {
        return reply('⚠️ Prefix must be 1–3 characters.');
    }

    const saved = botSettings.saveSettings({ prefix: newPrefix });
    if (!saved) return reply('❌ Failed to save prefix.');

    return reply(`✅ *Prefix updated.*

New prefix: *[ ${newPrefix} ]*
All menus and command examples will use this prefix from now on.

Try: \`${newPrefix}menu\``);
};

trashplug.help = ['setprefix <char>'];
trashplug.tags = ['owner'];
trashplug.command = ['setprefix', 'changeprefix', 'prefix'];

module.exports = trashplug;
