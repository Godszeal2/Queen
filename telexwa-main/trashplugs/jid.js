let trashplug = async (m, { reply }) => {
    reply(`┌ ❏ *⌜ JID INFO ⌟* ❏
│
├◆ 👤 *Your JID:* ${m.sender}
├◆ 💬 *Chat JID:* ${m.chat}
│
└ ❏`);
};

trashplug.help = ['jid'];
trashplug.tags = ['general'];
trashplug.command = ['jid'];

module.exports = trashplug;
