const os = require('os');
const moment = require('moment-timezone');
const fs = require('fs');
const chalk = require('chalk');

const makeMenu = (pushname = 'User') => {
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    const memUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
    const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(1);
    const now = moment().tz('Africa/Lagos');
    const time = now.format('HH:mm:ss');
    const date = now.format('DD MMMM YYYY');

    return `╭━━〔 𝐐𝐔𝐄𝐄𝐍 𝐀𝐁𝐈𝐌𝐒 👑  𝐕𝟏 〕━━╮
┃ 𝗦𝗬𝗦𝗧𝗘𝗠 𝗦𝗧𝗔𝗧𝗨𝗦: 𝗔𝗖𝗧𝗜𝗩𝗘
┃──────────────────────
┣ ᴜsᴇʀ       : ${pushname}
┣ ᴘʀᴇғɪx      : *[ . ]*
┣ ᴠᴇʀsɪᴏɴ     : *[ 1.0.0 ]* (Latest)
┣ ᴄᴏᴍᴍᴀɴᴅs   : *100+*
┣ ʀᴜɴᴛɪᴍᴇ     : ${hours}h ${minutes}m ${seconds}s
┣ ᴘʟᴀᴛғᴏʀᴍ    : linux
┣ sᴇʀᴠᴇʀ ʀᴀᴍ  : ${memUsed} MB / ${totalMem} GB
┣ ᴛɪᴍᴇ-ᴢᴏɴᴇ    : *[ Africa/Lagos ]*
┣ ᴛɪᴍᴇ          : ${time}
┣ ᴅᴀᴛᴇ          : ${date}
┣ ᴍᴀɪɴᴛᴀɪɴᴇᴅ   : *[ YES ]*
┣ ᴅᴇᴠᴇʟᴏᴘᴇʀ   : 𝙂𝙤𝙙'𝙨 𝙕𝙚𝙖𝙡 †
╰═「 ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝗤𝘂𝗲𝗲𝗻 𝗔𝗯𝗶𝗺𝘀 👑 」

╭━━━  *𝗠𝗔𝗜𝗡* ━━━╮

┃━ ᯬ   .menu || .help
┃━ ᯬ   .alive || .ping
┃━ ᯬ   .runtime
┃━ ᯬ   .owner || .dev || .repo
┃━ ᯬ   .support
┃━ ᯬ   .jid

╰═══════════════════

╭━━━  *𝗔𝗜 & 𝗜𝗠𝗔𝗚𝗘* ━━━╮

┃━ ᯬ   .ai || .ask <query>
┃━ ᯬ   .gemini <query>
┃━ ᯬ   .gpt || .llama <query>
┃━ ᯬ   .mixtral <query>
┃━ ᯬ   .imagine || .gen <description>
┃━ ᯬ   .chatbot on/off

╰═══════════════════

╭━━━  *𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥* ━━━╮

┃━ ᯬ   .play <song name/url>
┃━ ᯬ   .ytmp4 <video/url>
┃━ ᯬ   .apk <app name>
┃━ ᯬ   .vv  (reply view-once → reveal)
┃━ ᯬ   .vv2 (reply view-once → reveal + DM)

╰═══════════════════

╭━━━  *𝗧𝗢𝗢𝗟𝗦* ━━━╮

┃━ ᯬ   .sticker (reply image/video/gif)
┃━ ᯬ   .tts <text>
┃━ ᯬ   .translate <lang> <text>
┃━ ᯬ   .tourl (reply any media)
┃━ ᯬ   .time || .date
┃━ ᯬ   .morning || .afternoon || .evening

╰═══════════════════

╭━━━  *𝗚𝗔𝗠𝗘𝗦 & 𝗙𝗨𝗡* ━━━╮

┃━ ᯬ   .8ball <question>
┃━ ᯬ   .truth || .dare
┃━ ᯬ   .flirt @user
┃━ ᯬ   .character @user
┃━ ᯬ   .joke || .quote || .fact
┃━ ᯬ   .meme

╰═══════════════════

╭━━━  *𝗔𝗡𝗜𝗠𝗘 & 𝗜𝗠𝗔𝗚𝗘𝗦* ━━━╮

┃━ ᯬ   .waifu || .neko || .anime
┃━ ᯬ   .pies <china|japan|korea|indonesia|hijab>
┃━ ᯬ   .misc <heart|jail|gay|circle|simpcard>

╰═══════════════════

╭━━━  *𝗚𝗥𝗢𝗨𝗣 𝗠𝗔𝗡𝗔𝗚𝗘𝗠𝗘𝗡𝗧* ━━━╮

┃━ ᯬ   .tagall <text>
┃━ ᯬ   .gcstatus || .groupinfo
┃━ ᯬ   .setgname || .setgdesc || .setgpp
┃━ ᯬ   .warn @user
┃━ ᯬ   .addaccess || .delaccess

╰═══════════════════

╭━━━  *𝗢𝗪𝗡𝗘𝗥 & 𝗖𝗢𝗡𝗙𝗜𝗚* ━━━╮

┃━ ᯬ   .public || .private
┃━ ᯬ   .autoreact on/off
┃━ ᯬ   .setpp (reply image → set bot pic)
┃━ ᯬ   .trash
┃━ ᯬ   > <eval> || $ <shell>

╰═══════════════════

> ✨ Use *.aimenu .downloadmenu .gamemenu .adminmenu .animemenu* for category details`;
};

module.exports = makeMenu;

let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.redBright(`Update ${__filename}`));
    delete require.cache[file];
    require(file);
});
