const chalk = require('chalk')
const fs = require('fs')
const os = require('os')

const _uptime = process.uptime();
const _hours = Math.floor(_uptime / 3600);
const _minutes = Math.floor((_uptime % 3600) / 60);
const _memUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);

const Menu = `╔══════════════════════════════════╗
║   👑 *QUEEN ABIMS BOT v2.0.0*    ║
╚══════════════════════════════════╝

┌ ❏ *⌜ BOT INFO ⌟* ❏
│
├◆ 👑 *Owner:* 𝙂𝙤𝙙'𝙨 𝙕𝙚𝙖𝙡 †
├◆ ⚡ *Prefix:*  .
├◆ 🌐 *Version:* 2.0.0
├◆ ⏱️ *Uptime:* ${_hours}h ${_minutes}m
├◆ 💾 *RAM:* ${_memUsed} MB
├◆ ✅ *Status:* Online & Active
├◆ 📊 *Commands:* 52+
│
└ ❏

╔══ 🤖 *AI COMMANDS* [8] ══╗

├◆ .ai / .ask / .gpt <question>
├◆ .imagine / .gen <description>
├◆ .txt2img / .ai2img <prompt>
├◆ .chatbot on/off (group admin)

╔══ 📥 *DOWNLOAD* [4] ══╗

├◆ .play <song or URL>   [YT MP3]
├◆ .ytmp4 <video or URL> [YT MP4]
├◆ .vv (reply view-once) [reveal]
├◆ .vv2 (reply + send DM)[reveal+DM]

╔══ 🎮 *GAMES & FUN* [8] ══╗

├◆ .8ball <question>
├◆ .truth | .dare
├◆ .flirt | .character @user
├◆ .joke | .quote | .fact

╔══ 👥 *GROUP ADMIN* [10] ══╗

├◆ .tagall <msg> | .groupinfo
├◆ .gcstatus | .chatbot on/off
├◆ .setgname | .setgdesc
├◆ .setgpp | .addaccess | .delaccess

╔══ ⚡ *GENERAL* [9] ══╗

├◆ .alive | .ping | .menu
├◆ .owner | .dev | .repo
├◆ .jid | .help

╔══ 🔑 *OWNER ONLY* [5] ══╗

├◆ .public | .private
├◆ .autoreact on/off
├◆ .trash | > (eval) | $ (shell)

╔══ 📋 *CATEGORY MENUS* ══╗

├◆ .aimenu — AI commands detail
├◆ .downloadmenu — Download help
├◆ .gamemenu — Games & fun
├◆ .adminmenu — Group admin
├◆ .generalmenu — General cmds
├◆ .ownermenu — Owner panel

┌ ❏ *⌜ JOIN COMMUNITY ⌟* ❏
│
├◆ 🔗 Channel: t.me/aitoolshub01
├◆ 💬 Get updates & bot support
└ ❏`

module.exports = Menu

let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright(`Update ${__filename}`))
    delete require.cache[file]
    require(file)
})
