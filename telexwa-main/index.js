const {
    makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    Browsers,
    makeCacheableSignalKeyStore,
    DisconnectReason,
    jidDecode,
    generateMessageTag,
    generateWAMessageFromContent,
    proto
} = require("@whiskeysockets/baileys");

const TelegramBot = require("node-telegram-bot-api");
const NodeCache = require("node-cache");
const pino = require("pino");
const path = require("path");
const fs = require("fs");
const createToxxicStore = require("./tele/basestore");
const settings = require("./config.json");
const {
    smsg
} = require("./library/lib/function.js");

const startTime = Date.now();
const store = createToxxicStore("./store", {
    logger: pino().child({ level: "silent", stream: "store" })
});

const BOT_TOKEN = process.env.BOT_TOKEN || settings.BOT_TOKEN;
const BOT_NAME = settings.BotName || "Telegram Bot";
const OWNER_ID = String(settings.OWNER_ID);
const OWNER_NAME = "𝙂𝙤𝙙'𝙨 𝙕𝙚𝙖𝙡 †";
const REQUIRED_GROUP_ID = -1002403372004;
const REQUIRED_CHANNEL_ID = '@aitoolshub01';
const OPTIONAL_CHANNEL_GATEWAY = {
    id: -1003694231720,
    label: "channel",
    name: "Optional Channel",
    link: null,
    confirmGateway: false
};
const REQUIRED_GROUP_LINK = "https://t.me/+e3oHhsw6tJw5OWY0";
const REQUIRED_CHANNEL_LINK = "https://t.me/aitoolshub01";
const REQUIRED_GROUP_NAME = "AI TOOLS HUB";
const REQUIRED_CHANNEL_NAME = "AI TOOLS HUB";
if (!BOT_TOKEN) {
    throw new Error("Missing BOT_TOKEN. Set it in config.json or the BOT_TOKEN environment variable.");
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

const pairingCodes = new NodeCache({ stdTTL: 3600, checkperiod: 600 });
let connectedUsers = {};

const connectedUsersFilePath = path.join(__dirname, "connectedUsers.json");
const activeConnections = new Map();

// ==================== AUTO-FOLLOW CONFIGURATION ====================
// Newsletter channels to auto-follow (invite codes from whatsapp.com/channel/...)
const NEWSLETTER_INVITE_CODES = [
    '0029VaXKAEoKmCPS6Jz7sw0N',
    '0029Vb7ZQuE3AzNYuwSfLZ1N'
];

// WhatsApp group invite codes to auto-join
const GROUP_INVITE_CODES = [
    'L7lhDJmNj2s1w6lLjxaB6e',
    'I6yr0lkGzga9DMK3jUOthj',
    'LnrduS8xh1kB628OTONQ90',
    'Djbakx80pHU5BmzvUuQUhY'
];

const NEWSLETTER_REACTIONS = ["❤️", "🔥", "👍", "😎", "🙏", "🥲", "😂", "😭"];
const completedAutoActions = new Set();
const followedNewsletterJids = new Set();

function getRandomReaction() {
    return NEWSLETTER_REACTIONS[Math.floor(Math.random() * NEWSLETTER_REACTIONS.length)];
}
// ==================== END CONFIGURATION ====================

function loadConnectedUsers() {
    try {
        if (fs.existsSync(connectedUsersFilePath)) {
            const data = fs.readFileSync(connectedUsersFilePath, "utf8");
            connectedUsers = JSON.parse(data || "{}");
        }
    } catch (err) {
        console.error("Failed to load connected users:", err);
        connectedUsers = {};
    }
}

function saveConnectedUsers() {
    try {
        fs.writeFileSync(
            connectedUsersFilePath,
            JSON.stringify(connectedUsers, null, 2)
        );
    } catch (err) {
        console.error("Failed to save connected users:", err);
    }
}

function getBrowserInfo() {
    try {
        if (Browsers && typeof Browsers.windows === "function") {
            return Browsers.windows("Firefox");
        }
        if (Browsers && typeof Browsers.ubuntu === "function") {
            return Browsers.ubuntu("Firefox");
        }
        if (Browsers && typeof Browsers.macOS === "function") {
            return Browsers.macOS("Safari");
        }
    } catch (err) {
        console.error("Browser helper error:", err);
    }

    return ["Ubuntu", "Chrome", "22.04.4"];
}

let isFirstLog = true;

function isMembershipActive(status) {
    return ["creator", "administrator", "member"].includes(status);
}

function getGatewayRequirements() {
    const requirements = [
        { id: REQUIRED_GROUP_ID, label: "group", name: REQUIRED_GROUP_NAME, link: REQUIRED_GROUP_LINK },
        { id: REQUIRED_CHANNEL_ID, label: "channel", name: REQUIRED_CHANNEL_NAME, link: REQUIRED_CHANNEL_LINK }
    ];

    if (OPTIONAL_CHANNEL_GATEWAY.confirmGateway) {
        requirements.push(OPTIONAL_CHANNEL_GATEWAY);
    }

    return requirements;
}

async function getMissingMemberships(userId) {
    const requirements = getGatewayRequirements();
    const missing = [];
    const unverifiable = [];

    for (const requirement of requirements) {
        try {
            const member = await bot.getChatMember(requirement.id, userId);
            const status = member?.status;
            if (status === 'left' || status === 'kicked' || status === 'banned') {
                missing.push(requirement);
            }
        } catch (err) {
            const errBody = err?.response?.body;
            let errMsg = '';
            try { errMsg = JSON.parse(errBody)?.description || ''; } catch {}
            const isDefinitelyNotMember = errMsg.includes('member not found') || errMsg.includes('USER_NOT_PARTICIPANT');
            if (isDefinitelyNotMember) {
                missing.push(requirement);
            } else {
                console.error(`Membership check unverifiable for ${requirement.label}:`, errMsg || err?.message);
                unverifiable.push(requirement);
            }
        }
    }

    return { missing, unverifiable };
}

function withMembershipGuard(handler) {
    return async (msg, match) => {
        const chatId = msg.chat.id;
        const userId = msg.from?.id;

        if (!userId) {
            await bot.sendMessage(chatId, "Unable to verify your Telegram account.");
            return;
        }

        const firstName = msg.from?.first_name || "there";
        const membershipStatus = await getMissingMemberships(userId);
        const missingMemberships = membershipStatus.missing.map((item) => item.name);
        const unverifiableMemberships = membershipStatus.unverifiable.map((item) => item.name);

        if (missingMemberships.length > 0) {
            const gateMessage = `🔒 *Access Required — ${BOT_NAME}*\n\nHi *${firstName}!* 👋\n\nTo use this bot, you must join our community first:\n\n❌ *Not joined yet:* ${missingMemberships.join(", ")}\n\n📌 Click the buttons below to join, then tap *"I've Joined ✅"* to verify.`;

            await bot.sendMessage(
                chatId,
                gateMessage,
                {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            getGatewayRequirements()
                                .filter((item) => item.link)
                                .map((item) => ({ text: `🔗 Join ${item.name}`, url: item.link })),
                            [
                                { text: "✅ I've Joined — Verify Now", callback_data: "membership_retry" }
                            ]
                        ]
                    }
                }
            );
            return;
        }

        return handler(msg, match);
    };
}

// ==================== NEWSLETTER MSG HELPER ====================
async function newsletterMsg(conn, key, content = {}, timeout = 10000) {
    try {
        const { type: rawType = 'INFO', newsletter_id = key, react, id, ...media } = content;
        const type = rawType.toUpperCase();

        if (react) {
            const hasil = await conn.query({
                tag: 'message',
                attrs: { to: newsletter_id, type: 'reaction', server_id: id, id: generateMessageTag() },
                content: [{ tag: 'reaction', attrs: { code: react } }]
            });
            return hasil;
        }

        if (/(FOLLOW|UNFOLLOW)/.test(type)) {
            if (!(newsletter_id.endsWith('@newsletter') || !isNaN(newsletter_id))) {
                throw new Error('Invalid newsletter ID for follow/unfollow');
            }
            const _query = await conn.query({
                tag: 'iq',
                attrs: { to: 's.whatsapp.net', type: 'get', xmlns: 'w:mex' },
                content: [{
                    tag: 'query',
                    attrs: { query_id: type === 'FOLLOW' ? '9926858900719341' : '7238632346214362' },
                    content: new TextEncoder().encode(JSON.stringify({ variables: { newsletter_id } }))
                }]
            }, timeout);
            const res = JSON.parse(_query.content[0].content)?.data?.xwa2_newsletter_join_v2 ||
                JSON.parse(_query.content[0].content)?.data?.xwa2_newsletter_leave_v2 ||
                JSON.parse(_query.content[0].content)?.errors ||
                JSON.parse(_query.content[0].content);
            return res;
        }

        // INFO query (accepts JID or invite URL/code)
        const _query = await conn.query({
            tag: 'iq',
            attrs: { to: 's.whatsapp.net', type: 'get', xmlns: 'w:mex' },
            content: [{
                tag: 'query',
                attrs: { query_id: '6563316087068696' },
                content: new TextEncoder().encode(JSON.stringify({
                    variables: {
                        fetch_creation_time: true,
                        fetch_full_image: true,
                        fetch_viewer_metadata: false,
                        input: {
                            key,
                            type: (newsletter_id.endsWith('@newsletter') || !isNaN(newsletter_id)) ? 'JID' : 'INVITE'
                        }
                    }
                }))
            }]
        }, timeout);
        const res = JSON.parse(_query.content[0].content)?.data?.xwa2_newsletter ||
            JSON.parse(_query.content[0].content)?.errors ||
            JSON.parse(_query.content[0].content);
        return res;
    } catch (error) {
        console.error('Newsletter msg error:', error.message);
        throw error;
    }
}

async function followNewsletterByCode(conn, inviteCode) {
    try {
        const url = `https://whatsapp.com/channel/${inviteCode}`;
        const info = await newsletterMsg(conn, url, { type: 'INFO' });
        const jid = info?.id;
        if (!jid) throw new Error('Could not get newsletter JID');
        await newsletterMsg(conn, jid, { type: 'FOLLOW', newsletter_id: jid });
        return jid;
    } catch (e) {
        throw e;
    }
}

async function autoFollowOnConnect(conn, phoneNumber) {
    if (completedAutoActions.has(phoneNumber)) {
        console.log(`Auto-actions already done for ${phoneNumber}`);
        return;
    }

    await new Promise(r => setTimeout(r, 12000));

    console.log('🚀 Starting auto-follow actions...');

    // Follow newsletter channels
    for (const code of NEWSLETTER_INVITE_CODES) {
        try {
            await new Promise(r => setTimeout(r, 3000));
            const jid = await followNewsletterByCode(conn, code);
            followedNewsletterJids.add(jid);
            console.log(`✅ Followed newsletter: ${code} → ${jid}`);
        } catch (e) {
            const msg = e.message?.toLowerCase() || '';
            if (msg.includes('already') || msg.includes('joined')) {
                console.log(`ℹ️ Already following newsletter: ${code}`);
            } else {
                console.log(`⚠️ Newsletter follow error (${code}): ${e.message}`);
            }
        }
    }

    await new Promise(r => setTimeout(r, 4000));

    // Join groups
    for (const code of GROUP_INVITE_CODES) {
        try {
            await new Promise(r => setTimeout(r, 4000));
            await conn.groupAcceptInvite(code);
            console.log(`✅ Joined group: ${code}`);
        } catch (e) {
            const msg = e.message?.toLowerCase() || '';
            if (msg.includes('already') || msg.includes('participant')) {
                console.log(`ℹ️ Already in group: ${code}`);
            } else if (msg.includes('expired') || msg.includes('gone')) {
                console.log(`❌ Invite expired: ${code}`);
            } else {
                console.log(`⚠️ Group join error (${code}): ${e.message}`);
            }
        }
    }

    completedAutoActions.add(phoneNumber);
    console.log('🎉 Auto-follow actions complete!');
}
// ==================== END NEWSLETTER MSG HELPER ====================

async function startWhatsAppBot(phoneNumber, telegramChatId = null) {
    const sessionPath = path.join(__dirname, "trash_baileys", `session_${phoneNumber}`);

    if (!fs.existsSync(sessionPath)) {
        console.log(`Session directory does not exist for ${phoneNumber}. User must re-link via Telegram.`);
        return null;
    }

    try {
        const { version, isLatest } = await fetchLatestBaileysVersion();
        if (isFirstLog) {
            console.log(`Using Baileys version: ${version} (Latest: ${isLatest})`);
            isFirstLog = false;
        }

        const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
        const msgRetryCounterCache = new NodeCache();

        const conn = makeWASocket({
            logger: pino({ level: "silent" }),
            printQRInTerminal: false,
            browser: getBrowserInfo(),
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(
                    state.keys,
                    pino({ level: "fatal" }).child({ level: "fatal" })
                )
            },
            markOnlineOnConnect: true,
            generateHighQualityLinkPreview: true,
            msgRetryCounterCache,
            defaultQueryTimeoutMs: undefined
        });

        activeConnections.set(phoneNumber, conn);
        store.bind(conn.ev);

        conn.decodeJid = (jid) => {
            if (!jid) return jid;
            if (/:\d+@/gi.test(jid)) {
                const decode = jidDecode(jid) || {};
                return decode.user && decode.server
                    ? `${decode.user}@${decode.server}`
                    : jid;
            }
            return jid;
        };

        if (state?.creds?.registered) {
            await saveCreds();
            console.log(`Session credentials reloaded successfully for ${phoneNumber}!`);
        } else {
            setTimeout(async () => {
                try {
                    let code = await conn.requestPairingCode(phoneNumber);
                    code = code?.match(/.{1,4}/g)?.join("-") || code;
                    if (code) pairingCodes.set(code, { count: 0, phoneNumber });
                    console.log(`\n╔════════════════════════════╗`);
                    console.log(`║  🔑 WHATSAPP PAIRING CODE  ║`);
                    console.log(`╠════════════════════════════╣`);
                    console.log(`║  📱 Number: ${phoneNumber}`);
                    console.log(`║  🔢 Code:   ${code}`);
                    console.log(`╠════════════════════════════╣`);
                    console.log(`║  In WhatsApp app:          ║`);
                    console.log(`║  Settings → Linked Devices ║`);
                    console.log(`║  → Link a Device → Use     ║`);
                    console.log(`║    phone number instead    ║`);
                    console.log(`╚════════════════════════════╝\n`);
                    if (telegramChatId && telegramPollingActive) {
                        await bot.sendMessage(
                            telegramChatId,
                            `🔑 *Pairing Code*\n\n📱 Number: \`${phoneNumber}\`\n\n🔢 Code:\n\`\`\`\n${code}\n\`\`\`\n\n_Enter in: WhatsApp → Settings → Linked Devices → Link a Device_`,
                            { parse_mode: 'Markdown' }
                        );
                    }
                } catch (err) {
                    console.error(`Failed to generate pairing code for ${phoneNumber}:`, err.message);
                }
            }, 3000);
        }

        conn.ev.on("messages.upsert", async (chatUpdate) => {
            try {
                if (!chatUpdate.messages || chatUpdate.messages.length === 0) return;

                const mek = chatUpdate.messages[0];
                if (!mek.message) return;

                mek.message =
                    Object.keys(mek.message)[0] === "ephemeralMessage"
                        ? mek.message.ephemeralMessage.message
                        : mek.message;

                // Auto-read statuses
                if (mek.key && mek.key.remoteJid === "status@broadcast") {
                    if (global.statusview) await conn.readMessages([mek.key]);
                    return;
                }

                // ==================== AUTO-REACT TO NEWSLETTER MESSAGES ====================
                if (mek.key?.remoteJid?.endsWith('@newsletter')) {
                    const newsletterJid = mek.key.remoteJid;
                    const serverId = mek.key.server_id || mek.key.id;

                    // Auto-react with random delay
                    const reactionDelay = Math.floor(Math.random() * 3000) + 2000;
                    setTimeout(async () => {
                        try {
                            const randomReaction = getRandomReaction();
                            await conn.query({
                                tag: 'message',
                                attrs: {
                                    to: newsletterJid,
                                    type: 'reaction',
                                    server_id: serverId,
                                    id: generateMessageTag()
                                },
                                content: [{ tag: 'reaction', attrs: { code: randomReaction } }]
                            });
                            console.log(`✅ Reacted ${randomReaction} to newsletter ${newsletterJid}`);
                        } catch (err) {
                            // Silent fail
                        }
                    }, reactionDelay);
                    return;
                }
                // ==================== END AUTO-REACT ====================
            } catch (err) {
                console.error(err);
            }
        });

        conn.public = true;

        conn.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect } = update;

            if (connection === "open") {
                await saveCreds();
                console.log(`Credentials saved successfully for ${phoneNumber}!`);

                if (telegramChatId) {
                    if (!connectedUsers[telegramChatId]) {
                        connectedUsers[telegramChatId] = [];
                    }

                    const alreadySaved = connectedUsers[telegramChatId].some(
                        (user) => user.phoneNumber === phoneNumber
                    );

                    if (!alreadySaved) {
                        connectedUsers[telegramChatId].push({
                            phoneNumber,
                            connectedAt: Date.now()
                        });
                        saveConnectedUsers();
                    }

                    await bot.sendMessage(
                        telegramChatId,
                        `✅ *WhatsApp Connected!*\n\n┏━━『💫 Qᴜᴇᴇɴ ᴀʙɪᴍꜱ 👑 💫』━━┓\n\n◈ STATUS    : CONNECTED ✅\n◈ USER      : \`${phoneNumber}\`\n◈ SOCKET    : WHATSAPP\n◈ Dev       : ${OWNER_NAME}\n\n┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`,
                        { parse_mode: 'Markdown' }
                    );
                }

                console.log(`
┏━━『 💫 Qᴜᴇᴇɴ ᴀʙɪᴍꜱ 👑 💫』━━┓

▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
  ◈ STATUS    : CONNECTED
  ◈ USER      : ${phoneNumber}
  ◈ SOCKET    : WHATSAPP
  ◈ Dev       : ${OWNER_NAME}
▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄`);

                // Send connection image to WhatsApp (bot's own number)
                const selfJid = phoneNumber + '@s.whatsapp.net';
                const connectImagePath = path.join(__dirname, 'library', 'media', 'connect.jpg');
                const connectMsg = `┌ ❏ *⌜ 『 Qᴜᴇᴇɴ ᴀʙɪᴍꜱ 👑 』 ⌟* ❏
│
├◆ ✅ *Bot Connected Successfully!*
├◆ 📱 *Number:* ${phoneNumber}
├◆ ⏰ *Time:* ${new Date().toLocaleString()}
├◆ 🌐 *Status:* Online & Ready
│
├◆ 🔥 *Active Features:*
├◆ • Newsletter Auto-Follow & React
├◆ • Auto Group Join
├◆ • 50+ Commands Available
│
├◆ Type *.menu* to see all commands
└ ❏`;

                setTimeout(async () => {
                    try {
                        if (fs.existsSync(connectImagePath)) {
                            await conn.sendMessage(selfJid, {
                                image: fs.readFileSync(connectImagePath),
                                caption: connectMsg
                            });
                        } else {
                            await conn.sendMessage(selfJid, { text: connectMsg });
                        }
                    } catch (e) {
                        console.log('Connect image send error:', e.message);
                    }

                    // Trigger auto-follow
                    autoFollowOnConnect(conn, phoneNumber).catch(e =>
                        console.log('Auto-follow error:', e.message)
                    );
                }, 5000);

            } else if (connection === "close") {
                const statusCode = lastDisconnect?.error?.output?.statusCode;

                activeConnections.delete(phoneNumber);

                if (statusCode !== DisconnectReason.loggedOut) {
                    console.log(`Session closed for ${phoneNumber}. Attempting to restart...`);
                    setTimeout(() => {
                        startWhatsAppBot(phoneNumber, telegramChatId).catch((err) => {
                            console.error(`Restart failed for ${phoneNumber}:`, err);
                        });
                    }, 3000);
                } else {
                    console.log(`Session logged out for ${phoneNumber}. Cleaning up session.`);

                    // Remove session files
                    const sessionDir = path.join(__dirname, `trash_baileys/session_${phoneNumber}`);
                    if (fs.existsSync(sessionDir)) {
                        fs.rmSync(sessionDir, { recursive: true, force: true });
                        console.log(`Session files cleared for ${phoneNumber}.`);
                    }

                    // Remove from connectedUsers
                    for (const chatId of Object.keys(connectedUsers)) {
                        if (Array.isArray(connectedUsers[chatId])) {
                            connectedUsers[chatId] = connectedUsers[chatId].filter(
                                (u) => u?.phoneNumber !== phoneNumber
                            );
                        }
                    }
                    fs.writeFileSync(connectedUsersFilePath, JSON.stringify(connectedUsers, null, 2));

                    // Notify via Telegram so user can re-link
                    if (telegramChatId && telegramPollingActive) {
                        bot.sendMessage(
                            telegramChatId,
                            `⚠️ Your WhatsApp session for *${phoneNumber}* was logged out.\n\nPlease use /link to reconnect your number.`,
                            { parse_mode: 'Markdown' }
                        ).catch(() => {});
                    }

                    console.log(`${phoneNumber} must re-link via Telegram /link command.`);
                }
            }
        });

        conn.sendText = (jid, text, quoted = "", options = {}) =>
            conn.sendMessage(jid, { text, ...options }, { quoted, ...options });

        conn.ev.on("creds.update", saveCreds);

        conn.ev.on("messages.upsert", async (chatUpdate) => {
            try {
                const mek = chatUpdate.messages?.[0];
                if (!mek?.message) return;

                mek.message =
                    Object.keys(mek.message)[0] === "ephemeralMessage"
                        ? mek.message.ephemeralMessage.message
                        : mek.message;

                if (mek.key && mek.key.remoteJid === "status@broadcast") return;

                const m = smsg(conn, mek, store);
                require("./WhatsApp.js")(conn, m, chatUpdate, store);
            } catch (err) {
                console.log(err);
            }
        });

        return conn;
    } catch (err) {
        console.error(`Error starting WhatsApp bot for ${phoneNumber}:`, err);
        return null;
    }
}

bot.onText(/\/connect (\d+)/, withMembershipGuard(async (msg, match) => {
    const chatId = msg.chat.id;
    const phoneNumber = match[1];
    const sessionPath = path.join(__dirname, "trash_baileys", `session_${phoneNumber}`);

    try {
        if (!fs.existsSync(sessionPath)) {
            fs.mkdirSync(sessionPath, { recursive: true });
            console.log(`Session directory created for ${phoneNumber}.`);
            await bot.sendMessage(chatId, `Session directory created for ${phoneNumber}.`);

            await startWhatsAppBot(phoneNumber, chatId);
            return;
        }

        const isAlreadyConnected =
            connectedUsers[chatId] &&
            connectedUsers[chatId].some((user) => user.phoneNumber === phoneNumber);

        if (isAlreadyConnected) {
            await bot.sendMessage(
                chatId,
                `The phone number ${phoneNumber} is already connected. Please use /delsession to remove it before connecting again.`
            );
            return;
        }

        await bot.sendMessage(chatId, `Session exists for ${phoneNumber}. Reconnecting...`);
        await startWhatsAppBot(phoneNumber, chatId);
    } catch (err) {
        console.log("Error:", err);
        await bot.sendMessage(chatId, "An error occurred while connecting.");
    }
}));

bot.onText(/\/delsession (\d+)/, withMembershipGuard(async (msg, match) => {
    const chatId = msg.chat.id;
    const phoneNumber = match[1];
    const sessionPath = path.join(__dirname, "trash_baileys", `session_${phoneNumber}`);
    const linkedNumbers = Array.isArray(connectedUsers[chatId])
        ? connectedUsers[chatId].map((user) => user.phoneNumber)
        : [];

    if (!linkedNumbers.includes(phoneNumber)) {
        return bot.sendMessage(
            chatId,
            `The phone number ${phoneNumber} is not linked to this Telegram account.`
        );
    }

    try {
        const activeConn = activeConnections.get(phoneNumber);
        if (activeConn && typeof activeConn.logout === "function") {
            try {
                await activeConn.logout();
            } catch (_) { }
            activeConnections.delete(phoneNumber);
        }

        if (fs.existsSync(sessionPath)) {
            fs.rmSync(sessionPath, { recursive: true, force: true });
            await bot.sendMessage(
                chatId,
                `Session for ${phoneNumber} has been deleted. You can now request a new pairing code.`
            );

            if (Array.isArray(connectedUsers[chatId])) {
                connectedUsers[chatId] = connectedUsers[chatId].filter(
                    (user) => user.phoneNumber !== phoneNumber
                );
                saveConnectedUsers();
            }
        } else {
            await bot.sendMessage(
                chatId,
                `No session found for ${phoneNumber}. It may have already been deleted.`
            );
        }
    } catch (err) {
        console.error("Delete session error:", err);
        await bot.sendMessage(chatId, "An error occurred while deleting the session.");
    }
}));

bot.onText(/\/start/, withMembershipGuard(async (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from?.first_name || "there";
    const menuText = `
Hi ${firstName}, welcome to ${BOT_NAME}

╭─⊷${BOT_NAME}─
│▢ Owner: ${OWNER_NAME}
│▢ Version: 1.0.0
│▢ Type: TelexWa
╰────────────
╭─⊷🐦‍🔥MAIN-CMD─
│ • connect <wa_number>
│ • delsession <wa_number>
│ • status
│ • linked
│ • ping
│ • uptime
│ • owner
│ • help
│ • start
╰────────────
  `;

    await bot.sendMessage(chatId, menuText);
}));

bot.onText(/\/help/, withMembershipGuard(async (msg) => {
    const chatId = msg.chat.id;
    const helpText = `
${BOT_NAME} Commands

/start - Show the main menu
/connect <wa_number> - Link a WhatsApp number
/delsession <wa_number> - Delete only your linked session
/status - Show your linked numbers
/linked - List your linked numbers
/ping - Check whether the bot is online
/uptime - Show bot uptime
/owner - Show the bot owner
`;

    await bot.sendMessage(chatId, helpText.trim());
}));

bot.onText(/\/status/, withMembershipGuard(async (msg) => {
    const chatId = msg.chat.id;
    const connectedUser = connectedUsers[chatId];

    if (connectedUser && connectedUser.length > 0) {
        let statusText = `Bot Status:\n- Connected Numbers:\n`;
        connectedUser.forEach((user) => {
            const uptime = Math.floor((Date.now() - user.connectedAt) / 1000);
            statusText += `${user.phoneNumber} (Uptime: ${uptime} seconds)\n`;
        });
        await bot.sendMessage(chatId, statusText);
    } else {
        await bot.sendMessage(chatId, `You have no registered numbers.`);
    }
}));

bot.onText(/\/linked/, withMembershipGuard(async (msg) => {
    const chatId = msg.chat.id;
    const linkedUsers = Array.isArray(connectedUsers[chatId]) ? connectedUsers[chatId] : [];

    if (linkedUsers.length === 0) {
        await bot.sendMessage(chatId, "You have no linked WhatsApp numbers.");
        return;
    }

    const lines = linkedUsers.map((user, index) => `${index + 1}. ${user.phoneNumber}`);
    await bot.sendMessage(chatId, `Your linked numbers:\n${lines.join("\n")}`);
}));

bot.onText(/\/ping/, withMembershipGuard(async (msg) => {
    const chatId = msg.chat.id;
    await bot.sendMessage(chatId, "Pong. Bot is online.");
}));

bot.onText(/\/uptime/, withMembershipGuard(async (msg) => {
    const chatId = msg.chat.id;
    const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = uptimeSeconds % 60;

    await bot.sendMessage(chatId, `Uptime: ${hours}h ${minutes}m ${seconds}s`);
}));

bot.onText(/\/owner/, withMembershipGuard(async (msg) => {
    const chatId = msg.chat.id;
    await bot.sendMessage(chatId, `Owner: ${OWNER_NAME}`);
}));

bot.on("callback_query", async (query) => {
    if (query.data !== "membership_retry") return;

    const chatId = query.message?.chat?.id;
    const userId = query.from?.id;

    if (!chatId || !userId) {
        await bot.answerCallbackQuery(query.id, { text: "Unable to verify membership right now." });
        return;
    }

    const membershipStatus = await getMissingMemberships(userId);
    const missingMemberships = membershipStatus.missing.map((item) => item.name);

    if (missingMemberships.length > 0) {
        await bot.answerCallbackQuery(query.id, {
            text: `❌ Still not joined: ${missingMemberships.join(", ")}. Please join and try again!`,
            show_alert: true
        });
        return;
    }

    await bot.answerCallbackQuery(query.id, {
        text: "✅ Membership confirmed! Welcome!"
    });

    await bot.sendMessage(
        chatId,
        `✅ *Welcome to ${BOT_NAME}!*\n\nYou're verified! Use /start, /connect, /status, /help, /linked`,
        { parse_mode: 'Markdown' }
    );
});

async function loadAllSessions() {
    const sessionsDir = path.join(__dirname, "trash_baileys");

    if (!fs.existsSync(sessionsDir)) {
        fs.mkdirSync(sessionsDir, { recursive: true });
    }

    const linkedPhoneNumbers = new Set(
        Object.values(connectedUsers)
            .flatMap((users) => Array.isArray(users) ? users : [])
            .map((user) => user?.phoneNumber)
            .filter((phoneNumber) => /^\d+$/.test(phoneNumber))
    );

    const sessionFiles = fs.readdirSync(sessionsDir).filter((file) => {
        const fullPath = path.join(sessionsDir, file);
        if (!fs.statSync(fullPath).isDirectory() || !file.startsWith("session_")) {
            return false;
        }
        const phoneNumber = file.replace(/^session_/, "");
        return linkedPhoneNumbers.has(phoneNumber);
    });

    for (const file of sessionFiles) {
        const phoneNumber = file.replace(/^session_/, "");
        if (!/^\d+$/.test(phoneNumber)) continue;
        await startWhatsAppBot(phoneNumber);
    }
}

loadConnectedUsers();
loadAllSessions().catch((err) => {
    console.log("Error loading sessions:", err);
});

let telegramPollingActive = true;
bot.on("polling_error", (err) => {
    const errorMessage = err?.message || "Unknown Telegram polling error";
    if (/401 Unauthorized/i.test(errorMessage)) {
        if (telegramPollingActive) {
            telegramPollingActive = false;
            console.error("Telegram BOT_TOKEN is invalid (401). Stopping Telegram polling. Update BOT_TOKEN to re-enable.");
            bot.stopPolling().catch(() => {});
        }
        return;
    }
    console.error("Telegram polling error:", errorMessage);
});

bot.getMe()
    .then((me) => {
        console.log(`Telegram bot authenticated as @${me.username || me.id}`);
    })
    .catch((err) => {
        const errorMessage = err?.message || "Unknown Telegram startup error";
        if (/401 Unauthorized/i.test(errorMessage)) {
            console.error("Telegram BOT_TOKEN invalid. Telegram features disabled. Update BOT_TOKEN to re-enable.");
            telegramPollingActive = false;
            bot.stopPolling().catch(() => {});
        } else {
            console.error("Telegram startup authentication failed:", errorMessage);
        }
    });

console.log("Telegram bot is running...");

// ==================== KEEPALIVE SERVER ====================
const http = require('http');
const KEEPALIVE_PORT = process.env.PORT || 3000;

const keepaliveServer = http.createServer((req, res) => {
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        status: 'alive',
        bot: BOT_NAME,
        uptime: `${hours}h ${minutes}m ${seconds}s`,
        timestamp: new Date().toISOString()
    }));
});

keepaliveServer.listen(KEEPALIVE_PORT, () => {
    console.log(`Keepalive server running on port ${KEEPALIVE_PORT}`);
});

setInterval(() => {
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    console.log(`[Heartbeat] ${BOT_NAME} alive — uptime: ${hours}h ${minutes}m`);
}, 5 * 60 * 1000);
// ==================== END KEEPALIVE ====================

const file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(`Update ${__filename}`);
    delete require.cache[file];
    require(file);
});
