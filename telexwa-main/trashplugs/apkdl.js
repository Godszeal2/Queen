const axios = require('axios');

let trashplug = async (m, { text, trashcore, reply }) => {
    if (!text) {
        return reply(`📦 *APK Downloader*\n\n*Usage:* .apk <app name>\n\n*Examples:*\n• .apk WhatsApp\n• .apk Instagram\n• .apk TikTok\n• .apk Telegram\n• .apk YouTube\n\n_Downloads the latest APK from the Play Store_`);
    }

    await reply(`🔍 *Searching for:* ${text}...\n\n_Please wait..._`);

    try {
        const url = `https://api.princetechn.com/api/download/apkdl?apikey=prince&appName=${encodeURIComponent(text)}`;
        const { data } = await axios.get(url, { timeout: 20000 });

        if (!data?.success || !data?.result?.download_url) {
            return reply(`❌ *App not found:* "${text}"\n\nTry a different app name.`);
        }

        const r = data.result;
        const caption = `📦 *APK Downloaded!*\n\n📱 *App:* ${r.appname || text}\n👤 *Developer:* ${r.developer || 'Unknown'}\n\n📥 *Download Link:*\n${r.download_url}\n\n> 📦 Powered by 『 Qᴜᴇᴇɴ ᴀʙɪᴍꜱ 👑 』`;

        if (r.appicon) {
            await trashcore.sendMessage(m.chat, {
                image: { url: r.appicon },
                caption
            }, { quoted: m });
        } else {
            await reply(caption);
        }
    } catch (e) {
        reply(`❌ *Failed to fetch APK*\n\nError: ${e.message}\n\nTry again or use a different app name.`);
    }
};

trashplug.help = ['apk <app name>'];
trashplug.tags = ['tools'];
trashplug.command = ['apk', 'apkdl', 'apkdownload'];

module.exports = trashplug;
