const botSettings = require('../library/lib/settings');

let trashplug = async (m, { reply, text, trashown, prefix }) => {
    if (!trashown) return reply('👑 Owner only.');

    const layouts = botSettings.listLayouts();
    const requested = (text || '').trim().toLowerCase().split(/\s+/)[0];

    if (!requested) {
        const current = botSettings.getLayout();
        const list = layouts.map(name => {
            const t = botSettings.getTheme(name);
            const marker = name === current ? '✅' : '  ';
            return `│ ${marker} *${name}*  —  ${t.name}`;
        }).join('\n');
        return reply(`╭─〔 *LAYOUT THEMES* 〕─╮
│ Current: *${current}*
│
${list}
│
│ Usage: \`${prefix}setlayout <name>\`
│ Example: \`${prefix}setlayout neo\`
╰──────────────────╯`);
    }

    if (!layouts.includes(requested)) {
        return reply(`⚠️ Unknown layout: *${requested}*

Available: ${layouts.map(l => `*${l}*`).join(', ')}

Usage: \`${prefix}setlayout <name>\``);
    }

    const saved = botSettings.saveSettings({ layout: requested });
    if (!saved) return reply('❌ Failed to save layout.');

    const theme = botSettings.getTheme(requested);
    return reply(`✅ *Layout changed.*

Active theme: *${theme.name}* (${requested})
All menus and bot replies will use this style now.

Try: \`${prefix}menu\``);
};

trashplug.help = ['setlayout <name>'];
trashplug.tags = ['owner'];
trashplug.command = ['setlayout', 'theme', 'settheme', 'changelayout'];

module.exports = trashplug;
