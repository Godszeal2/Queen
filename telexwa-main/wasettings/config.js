// Owner Setting
global.owner = ["2349074488015",]
global.error = ["6666",]
global.ownername = "𝙂𝙤𝙙'𝙨 𝙕𝙚𝙖𝙡 †"
//━━━━━━━━━━━━━━━━━━━━━━━━//
// Bot Setting
global.botname = "『 Qᴜᴇᴇɴ ᴀʙɪᴍꜱ 👑 』"
global.botversion = "1.0.0"
global.typebot = "Plugin"
global.session = "queenabimsession"
global.connect = true
global.statusview = false
global.thumb = "https://jkgzqdubijffqnwcdqvp.supabase.co/storage/v1/object/public/uploads/Godszeal17.jpg"
global.wagc = "https://chat.whatsapp.com/L7lhDJmNj2s1w6lLjxaB6e?mode=gi_t"
//━━━━━━━━━━━━━━━━━━━━━━━━//
// Sticker Marker
global.packname = "Qᴜᴇᴇɴ ᴀʙɪᴍꜱ 👑"
global.author = "©𝐏𝐚𝐂𝐊𝐒"
//━━━━━━━━━━━━━━━━━━━━━━━━//
// Respon Message
global.mess = {
    success: '✅ Done.',
    admin: '🐞🚨 𝔸𝕕𝕞𝕚𝕟 𝕆𝕟𝕝𝕪 🚨🐞',
    premium: '🆘must be a premium user.',
    botAdmin: '🤖 𝕽𝖊𝖘𝖕𝖊𝖈𝖙 Qᴜᴇᴇɴ ᴀʙɪᴍꜱ 👑 𝖇𝖞 𝖒𝖆𝖐𝖎𝖓𝖌 𝖍𝖎𝖒 𝖆𝖉𝖒𝖎𝖓 𝖋𝖎𝖗𝖘𝖙.',
    owner: '👑 𝕺𝖜𝖓𝖊𝖗 𝖔𝖓𝖑𝖞.',
    OnlyGrup: '👥 𝕲𝖗𝖔𝖚𝖕 𝖔𝖓𝖑𝖞..',
    private: '📩 📩 𝕻𝖗𝖎𝖛𝖆𝖙𝖊 𝖈𝖍𝖆𝖙 𝖔𝖓𝖑𝖞..',
    wait: '⏳ 𝕻𝖗𝖔𝖈𝖊𝖘𝖘𝖎𝖓𝖌...',
    error: '⚠️ 𝕰𝖗𝖗𝖔𝖗 𝖔𝖈𝖈𝖚𝖗𝖗𝖊𝖉..',
}
//━━━━━━━━━━━━━━━━━━━━━━━━//
// File Update
let fs = require('fs')
let file = require.resolve(__filename)
fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(`Update File 📁 : ${__filename}`)
delete require.cache[file]
require(file)
})
