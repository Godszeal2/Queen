const fs = require('fs');
const path = require('path');

const dataDir = path.join(process.cwd(), 'data');
const warningsPath = path.join(dataDir, 'warnings.json');

function loadWarnings() {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    try {
        return JSON.parse(fs.readFileSync(warningsPath, 'utf8') || '{}');
    } catch {
        return {};
    }
}

function saveWarnings(data) {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(warningsPath, JSON.stringify(data, null, 2));
}

async function isGroupAdmin(trashcore, chatId, userId) {
    try {
        const meta = await trashcore.groupMetadata(chatId);
        const member = meta.participants.find(p => p.id === userId);
        return !!(member && (member.admin === 'admin' || member.admin === 'superadmin'));
    } catch {
        return false;
    }
}

let trashplug = async (m, { trashcore, reply, command, text, trashown }) => {
    if (!m.isGroup) return reply('❌ This command can only be used in groups!');

    const sender = m.key.participant || m.key.remoteJid;
    const botNumber = trashcore.user.id.split(':')[0] + '@s.whatsapp.net';

    const isBotAdmin = await isGroupAdmin(trashcore, m.chat, botNumber);
    const isSenderAdmin = await isGroupAdmin(trashcore, m.chat, sender);

    if (command === 'warn') {
        if (!isBotAdmin) return reply('❌ Make me a group admin first!');
        if (!isSenderAdmin && !trashown) return reply('❌ Only group admins can warn members.');

        let target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
            || m.message?.extendedTextMessage?.contextInfo?.participant
            || (m.quoted?.sender);

        if (!target) return reply('❌ *Usage:* .warn @user (mention or reply to a message)');
        if (target === botNumber) return reply('❌ I cannot warn myself!');
        if (target === sender) return reply('❌ You cannot warn yourself!');

        const warns = loadWarnings();
        if (!warns[m.chat]) warns[m.chat] = {};
        warns[m.chat][target] = (warns[m.chat][target] || 0) + 1;
        saveWarnings(warns);

        const count = warns[m.chat][target];
        const MAX = 3;

        await trashcore.sendMessage(m.chat, {
            text: `⚠️ *『 WARNING 』*\n\n👤 *User:* @${target.split('@')[0]}\n⚠️ *Warnings:* ${count}/${MAX}\n👮 *By:* @${sender.split('@')[0]}\n\n${count >= MAX ? '🚫 *Maximum warnings reached! Removing from group...*' : `_${MAX - count} more warning(s) before kick_`}`,
            mentions: [target, sender]
        }, { quoted: m });

        if (count >= MAX) {
            await new Promise(r => setTimeout(r, 1000));
            try {
                await trashcore.groupParticipantsUpdate(m.chat, [target], 'remove');
                delete warns[m.chat][target];
                saveWarnings(warns);
                await trashcore.sendMessage(m.chat, {
                    text: `🚫 @${target.split('@')[0]} was *removed* after reaching ${MAX} warnings!`,
                    mentions: [target]
                });
            } catch {
                reply('❌ Could not remove user. Make sure I have admin rights.');
            }
        }
        return;
    }

    if (command === 'warncount' || command === 'checkwarn') {
        let target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
            || m.message?.extendedTextMessage?.contextInfo?.participant
            || sender;

        const warns = loadWarnings();
        const count = warns[m.chat]?.[target] || 0;
        return reply(`⚠️ *Warn Count*\n\n👤 @${target.split('@')[0]} has *${count}/3* warnings.`, { mentions: [target] });
    }

    if (command === 'resetwarn') {
        if (!isSenderAdmin && !trashown) return reply('❌ Only admins can reset warnings.');
        let target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
            || m.message?.extendedTextMessage?.contextInfo?.participant;
        if (!target) return reply('❌ Mention a user to reset their warnings.');

        const warns = loadWarnings();
        if (warns[m.chat]) { delete warns[m.chat][target]; saveWarnings(warns); }
        return reply(`✅ Warnings cleared for @${target.split('@')[0]}`, { mentions: [target] });
    }

    if (command === 'listwarn') {
        const warns = loadWarnings();
        const groupWarns = warns[m.chat] || {};
        const entries = Object.entries(groupWarns).filter(([, v]) => v > 0);
        if (!entries.length) return reply('✅ No active warnings in this group.');
        const list = entries.map(([id, c]) => `• @${id.split('@')[0]} — ${c}/3`).join('\n');
        const mentions = entries.map(([id]) => id);
        await trashcore.sendMessage(m.chat, {
            text: `⚠️ *Active Warnings*\n\n${list}`,
            mentions
        });
        return;
    }
};

trashplug.help = ['warn @user', 'checkwarn @user', 'resetwarn @user', 'listwarn'];
trashplug.tags = ['admin'];
trashplug.command = ['warn', 'checkwarn', 'warncount', 'resetwarn', 'listwarn'];

module.exports = trashplug;
