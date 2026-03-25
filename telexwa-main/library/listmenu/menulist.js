const chalk = require('chalk')
const fs = require('fs')

const Menu = `┌ ❏ *⌜ 『 Qᴜᴇᴇɴ ᴀʙɪᴍꜱ 👑 』 ⌟* ❏
│
├◆ ᴏᴡɴᴇʀ: 𝙂𝙤𝙙'𝙨 𝙕𝙚𝙖𝙡 †
├◆ ᴘʀᴇғɪx: .
├◆ ᴠᴇʀsɪᴏɴ: 2.0.0
└ ❏

┌ ❏ *⌜ GENERAL COMMANDS ⌟* ❏
│
├◆ .menu / .help
├◆ .ping
├◆ .alive
├◆ .owner
├◆ .dev
├◆ .joke
├◆ .quote
├◆ .fact
├◆ .jid
├◆ .repo
└ ❏

┌ ❏ *⌜ AI COMMANDS ⌟* ❏
│
├◆ .ai <question>
├◆ .ask <question>
├◆ .gpt <question>
├◆ .chatbot on/off (group)
└ ❏

┌ ❏ *⌜ GAME COMMANDS ⌟* ❏
│
├◆ .8ball <question>
├◆ .truth
├◆ .dare
├◆ .flirt
├◆ .character @user
└ ❏

┌ ❏ *⌜ ADMIN COMMANDS ⌟* ❏
│
├◆ .tagall <message>
├◆ .chatbot <on/off>
├◆ .gcstatus <text/reply>
├◆ .groupinfo
├◆ .setgname <name>
├◆ .setgdesc <desc>
├◆ .setgpp (reply image)
└ ❏

┌ ❏ *⌜ MEDIA COMMANDS ⌟* ❏
│
├◆ .play <song name or URL>
├◆ .ytmp4 <link or search>
└ ❏

┌ ❏ *⌜ OWNER COMMANDS ⌟* ❏
│
├◆ .public
├◆ .private
├◆ .autoreact on/off
├◆ .addaccess <number>
├◆ .delaccess <number>
└ ❏

┌ ❏ *⌜ DEV COMMANDS ⌟* ❏
│
├◆ > (eval js)
├◆ $ (run shell)
├◆ .trash <number>
└ ❏

┌ ❏ *⌜ JOIN OUR COMMUNITY ⌟* ❏
│
├◆ 🔗 Channel: ${global.wagc || 'wa.me/channel/queenabimsbot'}
├◆ 💬 Get updates & support
└ ❏`

module.exports = Menu

let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright(`Update ${__filename}`))
    delete require.cache[file]
    require(file)
})
