const axios = require('axios');

// Resolve a WhatsApp channel/group invite link or code to its JID.
async function resolveChannelJid(input) {
    if (!input) return null;
    let code = String(input).trim();

    // Already a full JID
    if (code.endsWith('@newsletter') || code.endsWith('@g.us') || code.endsWith('@s.whatsapp.net')) {
        return { jid: code, type: code.split('@')[1] };
    }

    // Strip whatsapp.com/channel/<code> or chat.whatsapp.com/<code>
    const channelMatch = code.match(/(?:whatsapp\.com\/channel\/|wa\.me\/channel\/)([A-Za-z0-9_-]+)/i);
    const groupMatch = code.match(/chat\.whatsapp\.com\/([A-Za-z0-9_-]+)/i);
    if (channelMatch) code = channelMatch[1];
    else if (groupMatch) {
        return { code: groupMatch[1], type: 'group-invite' };
    }

    // Try to fetch the channel page and look for a JID-like number
    try {
        const url = `https://whatsapp.com/channel/${code}`;
        const { data: html } = await axios.get(url, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Pixel) AppleWebKit/537.36 Chrome/120.0 Mobile Safari/537.36'
            }
        });
        // Newsletter JIDs are 18-digit numbers
        const m = String(html).match(/(\d{15,20})@newsletter/);
        if (m) return { jid: `${m[1]}@newsletter`, type: 'newsletter', inviteCode: code };
        // Some pages embed the id in JSON like "id":"120363..."
        const m2 = String(html).match(/"id"\s*:\s*"(\d{15,20})"/);
        if (m2) return { jid: `${m2[1]}@newsletter`, type: 'newsletter', inviteCode: code };
    } catch (e) {
        // fall through
    }
    return { code, type: 'unresolved-newsletter' };
}

let trashplug = async (m, ctx) => {
    const { reply, text, trashcore, args } = ctx;

    // No argument → show JIDs of current chat / sender / quoted message
    if (!text) {
        const lines = [];
        lines.push('┌─〔 *JID INFO* 〕─┐');
        lines.push(`│ 👤 *You:*   \`${m.sender}\``);
        lines.push(`│ 💬 *Chat:*  \`${m.chat}\``);

        if (m.chat?.endsWith('@newsletter')) {
            lines.push(`│ 📰 *Type:*  Newsletter (read-only)`);
        } else if (m.chat?.endsWith('@g.us')) {
            lines.push(`│ 👥 *Type:*  Group`);
        } else if (m.chat?.endsWith('@s.whatsapp.net')) {
            lines.push(`│ 📩 *Type:*  Private chat`);
        }

        const quoted = m.quoted || m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const quotedParticipant =
            m.message?.extendedTextMessage?.contextInfo?.participant ||
            m.quoted?.sender ||
            null;
        if (quoted && quotedParticipant) {
            lines.push(`│`);
            lines.push(`│ ↩ *Quoted from:* \`${quotedParticipant}\``);
        }
        const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        if (mentioned.length) {
            lines.push(`│ 🔖 *Mentioned:*`);
            for (const j of mentioned) lines.push(`│   • \`${j}\``);
        }
        lines.push('└──────────────────┘');
        lines.push('');
        lines.push(`💡 *Tip:* Send  \`${ctx.prefix}getjid <channel-link>\`  to resolve a WhatsApp channel link to its newsletter JID.`);
        lines.push(`Example: \`${ctx.prefix}getjid https://whatsapp.com/channel/0029VaXKAEoKmCPS6Jz7sw0N\``);
        return reply(lines.join('\n'));
    }

    // Argument provided → try to resolve
    await reply('🔎 Resolving JID, please wait…');
    const result = await resolveChannelJid(text);

    const lines = ['┌─〔 *JID RESOLVER* 〕─┐'];
    lines.push(`│ 🔗 *Input:* ${text}`);
    if (result?.jid) {
        lines.push(`│ ✅ *JID:*   \`${result.jid}\``);
        lines.push(`│ 🏷 *Type:*  ${result.type}`);
        if (result.inviteCode) lines.push(`│ 🆔 *Code:*  ${result.inviteCode}`);
    } else if (result?.code) {
        lines.push(`│ ⚠️ *Could not resolve to a JID*`);
        lines.push(`│ 🆔 *Code:* ${result.code}`);
        lines.push(`│ 🏷 *Type:* ${result.type}`);
        lines.push(`│ The channel page may be private, removed, or the link is wrong.`);
    } else {
        lines.push(`│ ❌ *Invalid input.*`);
    }
    lines.push('└──────────────────┘');
    return reply(lines.join('\n'));
};

trashplug.help = ['getjid', 'jid'];
trashplug.tags = ['general'];
trashplug.command = ['getjid', 'jid', 'whois', 'resolvejid'];

module.exports = trashplug;
