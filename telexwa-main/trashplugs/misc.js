const axios = require('axios');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

async function getAvatarUrl(sock, m) {
    try {
        const quoted = m.quoted?.message || m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (quoted?.imageMessage) {
            const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
            const chunks = [];
            for await (const chunk of stream) chunks.push(chunk);
            const buf = Buffer.concat(chunks);
            const { CatBox } = require('../library/scrapes/uploader');
            const tmpPath = require('path').join(process.cwd(), 'tmp', `misc_${Date.now()}.jpg`);
            require('fs').writeFileSync(tmpPath, buf);
            const url = await CatBox(tmpPath);
            try { require('fs').unlinkSync(tmpPath); } catch {}
            return url;
        }
        const ctx = m.message?.extendedTextMessage?.contextInfo;
        let jid = ctx?.mentionedJid?.[0] || ctx?.participant || m.key.participant || m.key.remoteJid;
        const url = await sock.profilePictureUrl(jid, 'image');
        return url;
    } catch {
        return 'https://i.imgur.com/2wzGhpF.png';
    }
}

const EFFECTS_AVATAR_ONLY = ['heart', 'circle', 'lgbt', 'simpcard', 'lolice'];
const EFFECTS_OVERLAY = ['gay', 'glass', 'jail', 'triggered'];

const USAGE = `🎨 *Misc Image Effects*\n
*Usage:* .misc <effect>

*Avatar Effects:*
┃━ ᯬ .misc heart
┃━ ᯬ .misc circle
┃━ ᯬ .misc lgbt
┃━ ᯬ .misc simpcard
┃━ ᯬ .misc jail
┃━ ᯬ .misc gay
┃━ ᯬ .misc glass
┃━ ᯬ .misc triggered

*Text/Image Effects:*
┃━ ᯬ .misc tweet DisplayName|Username|Comment
┃━ ᯬ .misc youtube-comment Username|Comment
┃━ ᯬ .misc oogway <quote>

_Reply to an image or mention a user for effects!_`;

let trashplug = async (m, { trashcore, reply, args }) => {
    const sub = (args[0] || '').toLowerCase().trim();
    const rest = args.slice(1);

    if (!sub) return reply(USAGE);

    try {
        if (EFFECTS_AVATAR_ONLY.includes(sub)) {
            const avatarUrl = await getAvatarUrl(trashcore, m);
            const url = `https://api.some-random-api.com/canvas/misc/${sub}?avatar=${encodeURIComponent(avatarUrl)}`;
            const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 20000 });
            await trashcore.sendMessage(m.chat, {
                image: Buffer.from(res.data),
                caption: `🎨 *Effect: ${sub}*\n\n> 🎨 Powered by 『 Qᴜᴇᴇɴ ᴀʙɪᴍꜱ 👑 』`
            }, { quoted: m });
            return;
        }

        if (EFFECTS_OVERLAY.includes(sub)) {
            const avatarUrl = await getAvatarUrl(trashcore, m);
            const url = `https://api.some-random-api.com/canvas/overlay/${sub}?avatar=${encodeURIComponent(avatarUrl)}`;
            const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 20000 });
            await trashcore.sendMessage(m.chat, {
                image: Buffer.from(res.data),
                caption: `🎨 *Effect: ${sub}*\n\n> 🎨 Powered by 『 Qᴜᴇᴇɴ ᴀʙɪᴍꜱ 👑 』`
            }, { quoted: m });
            return;
        }

        if (sub === 'oogway' || sub === 'oogway2') {
            const quote = rest.join(' ').trim();
            if (!quote) return reply('❌ Usage: .misc oogway <your quote>');
            const avatarUrl = await getAvatarUrl(trashcore, m);
            const url = `https://api.some-random-api.com/canvas/misc/${sub}?quote=${encodeURIComponent(quote)}&avatar=${encodeURIComponent(avatarUrl)}`;
            const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 20000 });
            await trashcore.sendMessage(m.chat, { image: Buffer.from(res.data) }, { quoted: m });
            return;
        }

        if (sub === 'tweet') {
            const joined = rest.join(' ');
            const [displayname, username, comment, theme] = joined.split('|').map(s => (s || '').trim());
            if (!displayname || !username || !comment) return reply('❌ Usage: .misc tweet DisplayName|Username|Comment|theme(light/dark)');
            const avatarUrl = await getAvatarUrl(trashcore, m);
            const params = new URLSearchParams({ displayname, username, comment, avatar: avatarUrl });
            if (theme) params.append('theme', theme);
            const url = `https://api.some-random-api.com/canvas/misc/tweet?${params}`;
            const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 20000 });
            await trashcore.sendMessage(m.chat, { image: Buffer.from(res.data) }, { quoted: m });
            return;
        }

        if (sub === 'youtube-comment' || sub === 'ytcomment') {
            const joined = rest.join(' ');
            const [username, comment] = joined.split('|').map(s => (s || '').trim());
            if (!username || !comment) return reply('❌ Usage: .misc youtube-comment Username|Comment');
            const avatarUrl = await getAvatarUrl(trashcore, m);
            const params = new URLSearchParams({ username, comment, avatar: avatarUrl });
            const url = `https://api.some-random-api.com/canvas/misc/youtube-comment?${params}`;
            const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 20000 });
            await trashcore.sendMessage(m.chat, { image: Buffer.from(res.data) }, { quoted: m });
            return;
        }

        await reply(USAGE);

    } catch (err) {
        console.error('[MISC] Error:', err.message);
        reply(`❌ *Effect failed.* The API may be down or the image could not be processed.\n\n_Try replying to an image for better results._`);
    }
};

trashplug.help = ['misc <effect>'];
trashplug.tags = ['fun'];
trashplug.command = ['misc'];

module.exports = trashplug;
