const axios = require('axios');
const fs = require('fs');
const path = require('path');

let trashplug = async (m, { text, trashcore, reply }) => {
    if (!text) {
        return reply(`📦 *APK Downloader*\n\n*Usage:* .apk <app name>\n\n*Examples:*\n┃━ ᯬ .apk WhatsApp\n┃━ ᯬ .apk Instagram\n┃━ ᯬ .apk TikTok\n┃━ ᯬ .apk Telegram\n\n_Sends the APK file directly to chat!_`);
    }

    await reply(`🔍 *Searching for:* ${text}...\n\n_Please wait, downloading..._`);

    try {
        const url = `https://api.princetechn.com/api/download/apkdl?apikey=prince&appName=${encodeURIComponent(text)}`;
        const { data } = await axios.get(url, { timeout: 30000 });

        if (!data?.success || !data?.result?.download_url) {
            return reply(`❌ *No APK found for "${text}".*\n\nTry a different app name (e.g. "WhatsApp Messenger").`);
        }

        const r = data.result;
        const dlUrl = r.download_url;
        const appname = r.appname || text;
        const developer = r.developer || 'Unknown';
        const version = r.version || '';
        const size = r.size || '';

        const caption = `📦 *${appname}*\n\n👤 *Developer:* ${developer}${version ? `\n🔖 *Version:* ${version}` : ''}${size ? `\n📏 *Size:* ${size}` : ''}\n\n> 📦 Powered by 『 Qᴜᴇᴇɴ ᴀʙɪᴍꜱ 👑 』`;

        try {
            const tmpDir = path.join(__dirname, '../tmp');
            if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
            const fname = `${appname.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.apk`;
            const tmpPath = path.join(tmpDir, fname);

            await reply(`⬇️ *Downloading APK file... please wait*`);

            const apkRes = await axios.get(dlUrl, {
                responseType: 'arraybuffer',
                timeout: 120000,
                maxContentLength: 100 * 1024 * 1024,
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });

            fs.writeFileSync(tmpPath, Buffer.from(apkRes.data));

            await trashcore.sendMessage(m.chat, {
                document: { url: tmpPath },
                mimetype: 'application/vnd.android.package-archive',
                fileName: fname,
                caption
            }, { quoted: m });

            setTimeout(() => {
                try { if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath); } catch {}
            }, 30000);

        } catch (downloadErr) {
            console.error('[APK] File download failed, sending link:', downloadErr.message);
            const linkCaption = `📦 *${appname}*\n\n👤 *Developer:* ${developer}\n\n📥 *Download Link:*\n${dlUrl}\n\n_APK file too large to send directly._\n\n> 📦 Powered by 『 Qᴜᴇᴇɴ ᴀʙɪᴍꜱ 👑 』`;
            if (r.appicon) {
                await trashcore.sendMessage(m.chat, {
                    image: { url: r.appicon },
                    caption: linkCaption
                }, { quoted: m });
            } else {
                await reply(linkCaption);
            }
        }

    } catch (e) {
        console.error('[APK] Error:', e.message);
        reply(`❌ *Failed to fetch APK*\n\nError: ${e.message}\n\nTry again or use a different app name.`);
    }
};

trashplug.help = ['apk <app name>'];
trashplug.tags = ['tools'];
trashplug.command = ['apk', 'apkdl', 'apkdownload'];

module.exports = trashplug;
