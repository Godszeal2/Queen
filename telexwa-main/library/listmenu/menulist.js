const os = require('os');
const moment = require('moment-timezone');
const fs = require('fs');
const chalk = require('chalk');
const { getPrefix, getLayout, getTheme, fmt } = require('../lib/settings');

const BRAND = "𝗤𝘂𝗲𝗲𝗻 𝗔𝗯𝗶𝗺𝘀 👑";
const TITLE = "𝐐𝐔𝐄𝐄𝐍 𝐀𝐁𝐈𝐌𝐒 👑  𝐕𝟏";

function buildSection(theme, title, items) {
    const open = fmt(theme.sectionOpen, { title });
    const lines = items.map(i => fmt(theme.sectionLine, { item: i })).join('\n');
    const close = theme.sectionClose ? '\n' + theme.sectionClose : '';
    return `\n${open}\n\n${lines}${close}\n`;
}

const makeMenu = (pushname = 'User') => {
    const prefix = getPrefix();
    const layout = getLayout();
    const theme = getTheme(layout);

    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    const memUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
    const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(1);
    const now = moment().tz('Africa/Lagos');
    const time = now.format('HH:mm:ss');
    const date = now.format('DD MMMM YYYY');

    const top = fmt(theme.topBar, { title: TITLE });

    const headerLines = [
        fmt(theme.bodyLine, { label: 'ᴜsᴇʀ      ', value: pushname }),
        fmt(theme.bodyLine, { label: 'ᴘʀᴇғɪx    ', value: `*[ ${prefix} ]*` }),
        fmt(theme.bodyLine, { label: 'ᴛʜᴇᴍᴇ    ', value: `*[ ${theme.name} ]*` }),
        fmt(theme.bodyLine, { label: 'ᴠᴇʀsɪᴏɴ   ', value: '*[ 1.1.0 ]*' }),
        fmt(theme.bodyLine, { label: 'ᴄᴏᴍᴍᴀɴᴅs ', value: '*100+*' }),
        fmt(theme.bodyLine, { label: 'ʀᴜɴᴛɪᴍᴇ   ', value: `${hours}h ${minutes}m ${seconds}s` }),
        fmt(theme.bodyLine, { label: 'ᴘʟᴀᴛғᴏʀᴍ  ', value: os.platform() }),
        fmt(theme.bodyLine, { label: 'ʀᴀᴍ       ', value: `${memUsed} MB / ${totalMem} GB` }),
        fmt(theme.bodyLine, { label: 'ᴛɪᴍᴇ      ', value: time }),
        fmt(theme.bodyLine, { label: 'ᴅᴀᴛᴇ      ', value: date }),
        fmt(theme.bodyLine, { label: 'ᴅᴇᴠ       ', value: "𝙂𝙤𝙙'𝙨 𝙕𝙚𝙖𝙡 †" })
    ].join('\n');

    const bottom = fmt(theme.bottomBar, { brand: BRAND });

    const sections = [
        buildSection(theme, '𝗠𝗔𝗜𝗡', [
            `${prefix}menu  ||  ${prefix}help`,
            `${prefix}alive  ||  ${prefix}ping`,
            `${prefix}runtime`,
            `${prefix}owner  ||  ${prefix}dev  ||  ${prefix}repo`,
            `${prefix}support`,
            `${prefix}jid  ||  ${prefix}getjid`
        ]),
        buildSection(theme, '𝗔𝗜 & 𝗜𝗠𝗔𝗚𝗘', [
            `${prefix}ai  ||  ${prefix}ask <query>`,
            `${prefix}gemini <query>`,
            `${prefix}gpt  ||  ${prefix}llama <query>`,
            `${prefix}mixtral <query>`,
            `${prefix}imagine  ||  ${prefix}gen <description>`,
            `${prefix}chatbot on/off`
        ]),
        buildSection(theme, '𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥', [
            `${prefix}play <song name/url>`,
            `${prefix}ytmp4 <video/url>`,
            `${prefix}apk <app name>`,
            `${prefix}vv  (reply view-once → reveal)`,
            `${prefix}vv2 (reply view-once → reveal + DM)`
        ]),
        buildSection(theme, '𝗧𝗢𝗢𝗟𝗦', [
            `${prefix}sticker (reply image/video/gif)`,
            `${prefix}tts <text>`,
            `${prefix}translate <lang> <text>`,
            `${prefix}tourl (reply any media)`,
            `${prefix}time  ||  ${prefix}date`,
            `${prefix}morning  ||  ${prefix}afternoon  ||  ${prefix}evening`
        ]),
        buildSection(theme, '𝗚𝗔𝗠𝗘𝗦 & 𝗙𝗨𝗡', [
            `${prefix}8ball <question>`,
            `${prefix}truth  ||  ${prefix}dare`,
            `${prefix}flirt @user`,
            `${prefix}character @user`,
            `${prefix}joke  ||  ${prefix}quote  ||  ${prefix}fact`,
            `${prefix}meme`
        ]),
        buildSection(theme, '𝗔𝗡𝗜𝗠𝗘 & 𝗜𝗠𝗔𝗚𝗘𝗦', [
            `${prefix}waifu  ||  ${prefix}neko  ||  ${prefix}anime`,
            `${prefix}pies <china|japan|korea|indonesia|hijab>`,
            `${prefix}misc <heart|jail|gay|circle|simpcard>`
        ]),
        buildSection(theme, '𝗚𝗥𝗢𝗨𝗣 𝗠𝗔𝗡𝗔𝗚𝗘𝗠𝗘𝗡𝗧', [
            `${prefix}tagall <text>`,
            `${prefix}gcstatus  ||  ${prefix}groupinfo`,
            `${prefix}setgname  ||  ${prefix}setgdesc  ||  ${prefix}setgpp`,
            `${prefix}warn @user`,
            `${prefix}addaccess  ||  ${prefix}delaccess`
        ]),
        buildSection(theme, '𝗢𝗪𝗡𝗘𝗥 & 𝗖𝗢𝗡𝗙𝗜𝗚', [
            `${prefix}public  ||  ${prefix}private`,
            `${prefix}autoreact on/off`,
            `${prefix}setpp (reply image)`,
            `${prefix}setprefix <new>`,
            `${prefix}setlayout <royal|classic|neo|minimal|dark>`,
            `${prefix}trash`
        ])
    ].join('');

    return `${top}
${headerLines}
${bottom}
${sections}
${fmt(theme.footer, { brand: BRAND })}
> Tip: try *${prefix}aimenu*, *${prefix}downloadmenu*, *${prefix}gamemenu*, *${prefix}adminmenu*, *${prefix}animemenu* for category details.`;
};

module.exports = makeMenu;

let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.redBright(`Update ${__filename}`));
    delete require.cache[file];
    require(file);
});
