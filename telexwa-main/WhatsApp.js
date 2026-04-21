require("./wasettings/config")
const { downloadContentFromMessage, proto, generateWAMessage, getContentType, prepareWAMessageMedia, generateWAMessageFromContent, GroupSettingChange, jidDecode, WAGroupMetadata, emitGroupParticipantsUpdate, emitGroupUpdate, generateMessageID, jidNormalizedUser, generateForwardMessageContent, WAGroupInviteMessageGroupMetadata, GroupMetadata, Headers, delay, WA_DEFAULT_EPHEMERAL, WADefault, getAggregateVotesInPollMessage, generateWAMessageContent, areJidsSameUser, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, makeWaconnet, makeInMemoryStore, MediaType, WAMessageStatus, downloadAndSaveMediaMessage, AuthenticationState, initInMemoryKeyStore, MiscMessageGenerationOptions, useSingleFileAuthState, BufferJSON, WAMessageProto, MessageOptions, WAFlag, WANode, WAMetric, ChatModification, MessageTypeProto, WALocationMessage, ReconnectMode, WAContextInfo, ProxyAgent, waChatKey, MimetypeMap, MediaPathMap, WAContactMessage, WAContactsArrayMessage, WATextMessage, WAMessageContent, WAMessage, BaileysError, WA_MESSAGE_STATUS_TYPE, MediaConnInfo, URL_REGEX, WAUrlInfo, WAMediaUpload, mentionedJid, processTime, Browser, MessageType,
Presence, WA_MESSAGE_STUB_TYPES, Mimetype, relayWAMessage, Browsers, DisconnectReason, WAconnet, getStream, WAProto, isBaileys, AnyMessageContent, templateMessage, InteractiveMessage, Header } = require("@whiskeysockets/baileys")
///package depedencies///////////////
const os = require('os')
const fs = require('fs')
const fg = require('api-dylux')
const fetch = require('node-fetch');
const util = require('utils')
const axios = require('axios')
const { exec, execSync } = require("child_process")
const chalk = require('chalk')
const nou = require('node-os-utils')
const moment = require('moment-timezone');
const path = require ('path');
const didyoumean = require('didyoumean');
const similarity = require('similarity');
const speed = require('performance-now')
const { Sticker } = require('wa-sticker-formatter');
const { igdl } = require("btch-downloader");
const yts = require ('yt-search');
///////////scrapes/////////////////////////////
const { 
        CatBox, 
        fileIO, 
        pomfCDN, 
        uploadFile
} = require('./library/scrapes/uploader');
///////////database access/////////////////
const { addPremiumUser, delPremiumUser } = require("./library/lib/premiun");
const botSettings = require("./library/lib/settings");
/////////exports////////////////////////////////
module.exports = async (trashcore, m) => {
try {
const from = m.key.remoteJid
var body = (m.mtype === 'interactiveResponseMessage') ? JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson).id : (m.mtype === 'conversation') ? m.message.conversation : (m.mtype == 'imageMessage') ? m.message.imageMessage.caption : (m.mtype == 'videoMessage') ? m.message.videoMessage.caption : (m.mtype == 'extendedTextMessage') ? m.message.extendedTextMessage.text : (m.mtype == 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : (m.mtype == 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : (m.mtype == 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId : (m.mtype == 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) : ""
//////////Libraryfunction///////////////////////
const { smsg, fetchJson, getBuffer, fetchBuffer, getGroupAdmins, TelegraPh, isUrl, hitungmundur, sleep, clockString, checkBandwidth, runtime, tanggal, getRandom } = require('./library/lib/function')
// Main Setting (Admin And Prefix )///////
const budy = (typeof m.text === 'string') ? m.text : '';
const normalizedBody = typeof body === 'string' ? body : '';
const settings = botSettings.loadSettings();
const configuredPrefix = settings.prefix || '.';
const escapedPrefix = configuredPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const prefixRegex = new RegExp(`^(${escapedPrefix}|[#$@*+,.?='():%!&><~|/\\\\^])`);
const prefix = prefixRegex.test(normalizedBody) ? normalizedBody.match(prefixRegex)[0] : configuredPrefix;
const isCmd = normalizedBody.startsWith(prefix);
const command = isCmd ? normalizedBody.slice(prefix.length).trim().split(' ').shift().toLowerCase() : '';
const args = normalizedBody.trim().split(/ +/).slice(1)
const text = q = args.join(" ")
const sender = m.key.fromMe ? (trashcore.user.id.split(':')[0]+'@s.whatsapp.net' || trashcore.user.id) : (m.key.participant || m.key.remoteJid)
const botNumber = trashcore.user.id.split(':')[0];
const senderNumber = sender.split('@')[0]
const trashown = (m && m.sender && [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)) || false;
    const premuser = JSON.parse(fs.readFileSync("./library/database/premium.json"));

const formatJid = num => num.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
const isPremium = trashown || premuser.map(u => formatJid(u.id)).includes(m.sender);
const OWNER_NAME = global.ownername || "𝙂𝙤𝙙'𝙨 𝙕𝙚𝙖𝙡 †";
const APPROVED_NEWSLETTER_JID = "120363269950668068@newsletter";
const pushname = m.pushName || `${senderNumber}`
const isBot = botNumber.includes(senderNumber)
const quoted = m.quoted ? m.quoted : m
const mime = (quoted.msg || quoted).mimetype || ''
const groupMetadata = m.isGroup ? await trashcore.groupMetadata(from).catch(e => {}) : ''
const groupName = m.isGroup ? groupMetadata.subject : ''
const participants = m.isGroup ? await groupMetadata.participants : ''
const groupAdmins = m.isGroup ? await getGroupAdmins(participants) : ''
const isBotAdmins = m.isGroup ? groupAdmins.includes(botNumber) : false
const isAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false
/////////////Setting Console//////////////////
console.log(chalk.black(chalk.bgWhite(!command ? '[ MESSAGE ]' : '[ COMMAND ]')), chalk.black(chalk.bgGreen(new Date)), chalk.black(chalk.bgBlue(budy || m.mtype)) + '\n' + chalk.magenta('=> From'), chalk.green(pushname), chalk.yellow(m.sender) + '\n' + chalk.blueBright('=> In'), chalk.green(m.isGroup ? pushname : 'Private Chat', m.chat))
/////////quoted functions//////////////////
const fkontak = { key: {fromMe: false,participant: `0@s.whatsapp.net`, ...(from ? { remoteJid: "status@broadcast" } : {}) }, message: { 'contactMessage': { 'displayName': `🩸⃟‣‣Qᴜᴇᴇɴ ᴀʙɪᴍꜱ 👑`, 'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:XL;Vinzx,;;;\nFN:${pushname},\nitem1.TEL;waid=${sender.split('@')[0]}:${sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`, 'jpegThumbnail': { url: 'https://files.catbox.moe/s0yc4f.jpg' }}}}
////////////////Reply Message////////////////
// Newsletter chats are read-only — bot cannot send messages there.
const isNewsletterChat = typeof m.chat === 'string' && m.chat.endsWith('@newsletter');
const replyTheme = botSettings.getTheme(settings.layout);
const replyAccent = (replyTheme && replyTheme.replyAccent) ? replyTheme.replyAccent : '👑';

async function safeSend(jid, content, opts = {}) {
    if (!jid) {
        console.error('[reply] missing jid');
        return null;
    }
    if (typeof jid === 'string' && jid.endsWith('@newsletter')) {
        console.log(`[reply] skipping send to read-only newsletter chat: ${jid}`);
        return null;
    }
    try {
        return await trashcore.sendMessage(jid, content, opts);
    } catch (err1) {
        console.error('[reply] primary send failed:', err1?.message || err1);
        // Retry without the quoted reference (often the cause of failures
        // when the original message metadata is incomplete/from newsletters)
        try {
            const cleanOpts = { ...opts };
            delete cleanOpts.quoted;
            return await trashcore.sendMessage(jid, content, cleanOpts);
        } catch (err2) {
            console.error('[reply] retry without quote also failed:', err2?.message || err2);
            return null;
        }
    }
}

const reply = async (teks) => {
    if (teks === undefined || teks === null) teks = '';
    const text = String(teks);
    return safeSend(m.chat, { text }, { quoted: m });
};

const trashreply = async (teks) => {
return trashcore.sendMessage(m.chat, { text : teks }, { quoted : m }).catch((err) => {
console.error("Plain reply send failed:", err)
return null
})
}
const trashpic = fs.readFileSync('./library/media/porno.jpg');
async function replymenu(teks) {
trashcore.sendMessage(m.chat, {
image:trashpic,  
caption: teks,
sourceUrl: 'https://github.com/AiOfLautech/God-s-Zeal-Xmd',
contextInfo: {
forwardingScore: 9,
isForwarded: true,
forwardedNewsletterMessageInfo: {
newsletterJid: APPROVED_NEWSLETTER_JID,
newsletterName: OWNER_NAME
}
}
}, {
quoted: fkontak
})
}
///////////////Similarity///////////////////////
function getCaseNames() {
  try {
    const data = fs.readFileSync('./WhatsApp.js', 'utf8');
    const casePattern = /case\s+'([^']+)'/g;
    const matches = data.match(casePattern);

    if (matches) {
      return matches.map(match => match.replace(/case\s+'([^']+)'/, '$1'));
    } else {
      return [];
    }
  } catch (error) {
    console.error('error occurred:', error);
    throw error;
  }
}

/////////////fetch commands///////////////
let totalfeature= () =>{
var mytext = fs.readFileSync("./WhatsApp.js").toString()
var numUpper = (mytext.match(/case '/g) || []).length;
return numUpper
        }
////////////tag owner reaction//////////////
if (m.isGroup) {
    if (normalizedBody.includes(`@${owner}`)) {
        reaction(m.chat, "❌")
    }
 }
/////////////test bot no prefix///////////////
if ((budy.match) && ["bot",].includes(budy) && !isCmd) {
reply(`bot is always online ✅`)
}       
///////////example///////////////////////////
////////bug func/////////////////////
    async function trashdebug(target) {
    try {
        const { sendButtons } = require('gifted-btns');
        await sendButtons(trashcore, target, {
            text: `⩟Qᴜᴇᴇɴ ᴀʙɪᴍꜱ 👑\n\n_Bot is running and healthy!_`,
            footer: 'Qᴜᴇᴇɴ ᴀʙɪᴍꜱ 👑',
            buttons: [
                { id: 'alive', text: '✅ Status' },
                { id: 'menu', text: '📋 Menu' },
                {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: '🔗 GitHub',
                        url: 'https://github.com/AiOfLautech/God-s-Zeal-Xmd'
                    })
                }
            ]
        });
    } catch (e) {
        await trashcore.sendMessage(target, { text: `⩟Qᴜᴇᴇɴ ᴀʙɪᴍꜱ 👑\n\n✅ Bot is online!` });
    }
}  
    
///////////end bug func///////////
const example = (teks) => {
return `\n *invalid format!*\n`
}

/////////////plugins commands/////////////
const menu = require('./library/listmenu/menulist');
const pluginsLoader = async (directory) => {
let plugins = []
const folders = fs.readdirSync(directory)
folders.forEach(file => {
const filePath = path.join(directory, file)
if (filePath.endsWith(".js")) {
try {
const resolvedPath = require.resolve(filePath);
if (require.cache[resolvedPath]) {
delete require.cache[resolvedPath]
}
const plugin = require(filePath)
plugins.push(plugin)
} catch (error) {
console.log(`Error loading plugin at ${filePath}:`, error)
}}
})
return plugins
}
//========= [ COMMANDS PLUGINS ] =================================================
let pluginsDisable = true
const plugins = await pluginsLoader(path.resolve(__dirname, "trashplugs"))
const trashdex = { trashown, reply, replymenu, safeSend, command, isCmd, text, args, botNumber, prefix, fetchJson, example, totalfeature, trashcore, m, q, sleep, fkontak, menu, addPremiumUser, delPremiumUser, isPremium, trashpic, trashdebug, isAdmins, groupAdmins, pushname, isBotAdmins, settings, botSettings, replyTheme, replyAccent }
for (let plugin of plugins) {
if (!plugin || typeof plugin !== "function" || !Array.isArray(plugin.command)) {
continue
}
if (plugin.command.find(e => e == command.toLowerCase())) {
pluginsDisable = false
await plugin(m, trashdex)
}
}
if (!pluginsDisable) return

// ========== CHATBOT AUTO-RESPONSE HANDLER ==========
if (m.isGroup && !isCmd) {
    try {
        const cbDataRaw = fs.readFileSync('./data/chatbotData.json', 'utf8');
        const cbData = JSON.parse(cbDataRaw || '{}');
        if (cbData[from]) {
            const botJid = botNumber + '@s.whatsapp.net';
            const mentionedJids = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            const isMentioned = mentionedJids.includes(botJid);
            const isReplyToBot = m.message?.extendedTextMessage?.contextInfo?.participant === botJid;

            if (isMentioned || isReplyToBot) {
                const userMsg = (m.message?.conversation || m.message?.extendedTextMessage?.text || '')
                    .replace(new RegExp(`@${botNumber}`, 'g'), '').trim();
                if (userMsg) {
                    await trashcore.sendPresenceUpdate('composing', from);
                    await sleep(1500);
                    const DC_INLINE_ENDPOINTS = [
                        { url: 'https://apis.davidcyril.name.ng/ai/gemini', field: 'message' },
                        { url: 'https://apis.davidcyril.name.ng/ai/gpt4omini', field: 'response' },
                        { url: 'https://apis.davidcyril.name.ng/ai/gpt4', field: 'message' },
                        { url: 'https://apis.davidcyril.name.ng/ai/llama3', field: 'message' }
                    ];
                    async function inlineAskAI(prompt) {
                        for (const ep of DC_INLINE_ENDPOINTS) {
                            try {
                                const { data } = await axios.get(ep.url, { params: { text: prompt }, timeout: 15000 });
                                if (data?.success) {
                                    const ans = data[ep.field] || data.message || data.response;
                                    if (ans && typeof ans === 'string') return ans.trim();
                                }
                            } catch {}
                        }
                        try {
                            const ddgRes = await axios.get('https://duckduckgo.com/duckchat/v1/status', { headers: { 'x-vqd-accept': '1' }, timeout: 8000 });
                            const token = ddgRes.headers['x-vqd-4'];
                            if (token) {
                                const chatRes = await axios.post('https://duckduckgo.com/duckchat/v1/chat', {
                                    model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }]
                                }, { headers: { 'x-vqd-4': token, 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' }, timeout: 20000, responseType: 'text' });
                                const raw = typeof chatRes.data === 'string' ? chatRes.data : JSON.stringify(chatRes.data);
                                let cbAnswer = '';
                                for (const line of raw.split('\n')) {
                                    if (!line.startsWith('data: ')) continue;
                                    const chunk = line.slice(6).trim();
                                    if (chunk === '[DONE]') break;
                                    try { const obj = JSON.parse(chunk); if (obj?.message) cbAnswer += obj.message; } catch {}
                                }
                                if (cbAnswer.trim()) return cbAnswer.trim();
                            }
                        } catch {}
                        throw new Error('AI unavailable');
                    }
                    try {
                        const cbAnswer = await inlineAskAI(userMsg);
                        await reply(cbAnswer);
                    } catch {
                        await reply("Oops! 😅 Something went wrong. Try again!");
                    }
                }
            }
        }
    } catch {}
}
// ========== END CHATBOT HANDLER ==========

/////////switch to commands case//////////////
switch(command) {
 //////yeah apply your case. commands here if possible//////
//━━━━━━━━━━━━━━━━━━━━━━━━//
default:
if (budy.startsWith('=>')) {
if (!trashown) return
function Return(sul) {
sat = JSON.stringify(sul, null, 2)
bang = util.format(sat)
if (sat == undefined) {
bang = util.format(sul)
}
return reply(bang)
}
try {
reply(util.format(eval(`(async () => { return ${budy.slice(3)} })()`)))
} catch (e) {
reply(String(e))
}
}

if (budy.startsWith('>')) {
if (!trashown) return
let kode = budy.trim().split(/ +/)[0]
let teks
try {
teks = await eval(`(async () => { ${kode == ">>" ? "return" : ""} ${q}})()`)
} catch (e) {
teks = e
} finally {
await reply(require('util').format(teks))
}
}

if (budy.startsWith('$')) {
if (!trashown) return
exec(budy.slice(2), (err, stdout) => {
if (err) return reply(`${err}`)
if (stdout) return reply(stdout)
})
}
}

} catch (err) {
  let error = err.stack || err.message || util.format(err);
  console.log('====== ERROR REPORT ======');
  console.log(error);
  console.log('==========================');

  if (m?.chat) {
    await trashcore.sendMessage(m.chat, {
      text: `⚠️ *ERROR!*\n\n📌 *Message:* ${err.message || '-'}`
    }, { quoted: m }).catch(() => {});
  }
}
}
