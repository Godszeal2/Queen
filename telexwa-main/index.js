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

// ==================== GATEWAY CONFIG (JSON-driven) ====================
function loadGatewayConfig() {
    try {
        const p = path.join(__dirname, 'data', 'telegram_gateway.json');
        const cfg = JSON.parse(fs.readFileSync(p, 'utf8'));
        return {
            enabled: !!cfg.enabled,
            requirements: Array.isArray(cfg.requirements) ? cfg.requirements : []
        };
    } catch {
        return { enabled: false, requirements: [] };
    }
}

function loadTelegramBots() {
    try {
        const p = path.join(__dirname, 'data', 'telegram_bots.json');
        const cfg = JSON.parse(fs.readFileSync(p, 'utf8'));
        return Array.isArray(cfg.bots) ? cfg.bots : [];
    } catch {
        return [];
    }
}
if (!BOT_TOKEN) {
    throw new Error("Missing BOT_TOKEN. Set it in config.json or the BOT_TOKEN environment variable.");
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

const pairingCodes = new NodeCache({ stdTTL: 3600, checkperiod: 600 });
let connectedUsers = {};

const connectedUsersFilePath = path.join(__dirname, "connectedUsers.json");
const activeConnections = new Map();

// ───── Per-bot capacity (memory-safe) ─────
// Each running WA session uses ~5-15MB. We cap at 50 to keep RSS reasonable.
const MAX_SESSIONS = parseInt(process.env.MAX_SESSIONS || '50', 10);
function isBotFull() { return activeConnections.size >= MAX_SESSIONS; }
function escHtml(s = '') {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ==================== AUTO-FOLLOW CONFIGURATION (JSON-driven) ====================
function loadWhatsAppGroupsConfig() {
    try {
        const p = path.join(__dirname, 'data', 'whatsapp_channels.json');
        const cfg = JSON.parse(fs.readFileSync(p, 'utf8'));
        return {
            newsletters: Array.isArray(cfg.newsletters) ? cfg.newsletters : [],
            groups: Array.isArray(cfg.groups) ? cfg.groups : [],
            autoReactEnabled: cfg.autoReactEnabled !== false,
            reactions: Array.isArray(cfg.reactions) && cfg.reactions.length
                ? cfg.reactions
                : ["❤️", "🔥", "👍", "😎", "🙏", "🥲", "😂", "😭"]
        };
    } catch (e) {
        console.error('[wa-channels] failed to load whatsapp_channels.json:', e.message);
        return { newsletters: [], groups: [], autoReactEnabled: true, reactions: ["❤️", "🔥", "👍"] };
    }
}

const completedAutoActions = new Set();
const followedNewsletterJids = new Set();

function getRandomReaction() {
    const r = loadWhatsAppGroupsConfig().reactions;
    return r[Math.floor(Math.random() * r.length)];
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
    return loadGatewayConfig().requirements.map(r => ({
        id: r.id,
        label: r.type || 'channel',
        name: r.name,
        link: r.link
    }));
}

async function getMissingMemberships(userId) {
    const cfg = loadGatewayConfig();
    if (!cfg.enabled) return { missing: [], unverifiable: [] };
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
    const url = `https://whatsapp.com/channel/${inviteCode}`;

    // 1) Try the GraphQL info path
    let jid = null;
    try {
        const info = await newsletterMsg(conn, url, { type: 'INFO' });
        jid = info?.id
            || info?.jid
            || info?.thread_metadata?.invite
            || info?.metadata?.id
            || null;
    } catch (e) {
        // Swallow — we'll try the HTTP fallback next
    }

    // 2) Fallback: scrape the channel page HTML for the JID
    if (!jid) {
        try {
            const axios = require('axios');
            const { data: html } = await axios.get(url, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Pixel) AppleWebKit/537.36 Chrome/120.0 Mobile Safari/537.36'
                }
            });
            const m1 = String(html).match(/(\d{15,20})@newsletter/);
            const m2 = String(html).match(/"id"\s*:\s*"(\d{15,20})"/);
            if (m1) jid = `${m1[1]}@newsletter`;
            else if (m2) jid = `${m2[1]}@newsletter`;
        } catch (e) {
            // Both paths failed
        }
    }

    if (!jid) throw new Error('Could not get newsletter JID (channel may be invalid or private)');

    await newsletterMsg(conn, jid, { type: 'FOLLOW', newsletter_id: jid });
    return jid;
}

async function autoFollowOnConnect(conn, phoneNumber) {
    if (completedAutoActions.has(phoneNumber)) {
        console.log(`Auto-actions already done for ${phoneNumber}`);
        return;
    }

    await new Promise(r => setTimeout(r, 12000));

    console.log('🚀 Starting auto-follow actions...');

    const waCfg = loadWhatsAppGroupsConfig();

    // Follow newsletter channels
    for (const item of waCfg.newsletters) {
        const code = typeof item === 'string' ? item : item.code;
        if (!code) continue;
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
    for (const item of waCfg.groups) {
        const code = typeof item === 'string' ? item : item.code;
        if (!code) continue;
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
                        // HTML <pre><code> renders as a copyable code block on
                        // Telegram mobile (long-press → Copy, or tap the copy
                        // icon). More reliable than MarkdownV2 escaping.
                        const html =
                            `🔑 <b>Pairing Code Ready</b>\n\n` +
                            `📱 Number: <code>${escHtml(phoneNumber)}</code>\n\n` +
                            `🔢 <b>Tap the code below to copy:</b>\n\n` +
                            `<pre><code>${escHtml(code)}</code></pre>\n\n` +
                            `📲 <b>How to enter:</b>\n` +
                            `1. Open WhatsApp\n` +
                            `2. Settings → Linked Devices\n` +
                            `3. Link a Device → <i>Link with phone number</i>\n` +
                            `4. Enter the code above\n\n` +
                            `<i>Code expires in ~60 seconds.</i>`;
                        await bot.sendMessage(telegramChatId, html, {
                            parse_mode: 'HTML',
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: `📋 Copy: ${code}`, callback_data: `copy_${code}` }],
                                    [
                                        { text: '🔄 Regenerate', callback_data: `regen_${phoneNumber}` },
                                        { text: '❌ Cancel', callback_data: `cancel_${phoneNumber}` }
                                    ]
                                ]
                            }
                        }).catch(async () => {
                            // Plain-text fallback
                            await bot.sendMessage(
                                telegramChatId,
                                `🔑 Pairing Code\n\nNumber: ${phoneNumber}\n\nCode: ${code}\n\nWhatsApp → Settings → Linked Devices → Link with phone number → enter the code.`,
                                {
                                    reply_markup: {
                                        inline_keyboard: [[{ text: `📋 Copy: ${code}`, callback_data: `copy_${code}` }]]
                                    }
                                }
                            );
                        });
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
                    if (!loadWhatsAppGroupsConfig().autoReactEnabled) return;
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
                            `⚠️ Your WhatsApp session for *${phoneNumber}* was logged out.\n\nPlease use /connect to reconnect your number.`,
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

                // Skip bot's own Baileys-sent messages (echoes) but allow owner
                // commands from their primary phone (also fromMe but not isBaileys)
                const msgId = mek.key?.id || '';
                if (mek.key?.fromMe && msgId.startsWith('BAE5') && msgId.length === 16) return;

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

    // ── Capacity guard: 50 sessions per bot ──
    const alreadyOnThisBot = activeConnections.has(phoneNumber);
    if (!alreadyOnThisBot && isBotFull()) {
        await bot.sendMessage(
            chatId,
            `🚫 *Bot is Full*\n\nThis bot has reached its capacity of *${MAX_SESSIONS}* connected WhatsApp numbers.\n\nPlease try again later, or ask the owner to deploy another bot instance for new users.`,
            { parse_mode: 'Markdown' }
        );
        return;
    }

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
    const menuText =
`👋 *Welcome ${firstName}!*

╭─⊷ *${BOT_NAME}*
│▢ Owner: ${OWNER_NAME}
│▢ Version: 1.1.0
│▢ Type: TelexWa Hybrid
╰────────────

🔗 *Quick Start*
Send: \`/connect 234XXXXXXXXXX\`
( your WhatsApp number, country code first, no + )

📋 You'll get a pairing code that you tap to copy, then paste in WhatsApp → Linked Devices.

Tap a button below to begin.`;

    await bot.sendMessage(chatId, menuText, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [{ text: '🔗 How to Connect', callback_data: 'help_connect' }, { text: '📋 My Linked Numbers', callback_data: 'show_linked' }],
                [{ text: '📊 Status', callback_data: 'show_status' }, { text: '⏱️ Uptime', callback_data: 'show_uptime' }],
                [{ text: '👤 Owner', callback_data: 'show_owner' }, { text: '❓ Help', callback_data: 'show_help' }]
            ]
        }
    });
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

// ==================== TELEGRAM HELPERS ====================
// Convert URLs in a message into inline-keyboard URL buttons (one per link).
function extractUrlButtons(text) {
    if (!text) return { cleanText: text, buttons: [] };
    const urlRegex = /(https?:\/\/[^\s<>()"']+)/g;
    const seen = new Set();
    const buttons = [];
    let cleanText = text;
    let m;
    while ((m = urlRegex.exec(text)) !== null) {
        const url = m[1].replace(/[.,;)]+$/, '');
        if (!seen.has(url)) {
            seen.add(url);
            const label = (() => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return 'Open Link'; } })();
            buttons.push([{ text: `🔗 ${label}`, url }]);
        }
    }
    return { cleanText, buttons };
}

async function sendWithLinkButtons(chatId, text, extra = {}) {
    const { cleanText, buttons } = extractUrlButtons(text);
    const opts = { ...extra };
    if (buttons.length) {
        opts.reply_markup = { inline_keyboard: [...buttons, ...((extra.reply_markup?.inline_keyboard) || [])] };
    }
    return bot.sendMessage(chatId, cleanText, opts);
}

// ==================== /broadcast ====================
bot.onText(/\/broadcast(?:\s+([\s\S]+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = String(msg.from?.id || '');
    if (userId !== OWNER_ID) return bot.sendMessage(chatId, '🚫 Owner only.');

    let text = (match && match[1]) ? match[1].trim() : '';
    if (!text && msg.reply_to_message) {
        text = msg.reply_to_message.text || msg.reply_to_message.caption || '';
    }
    if (!text) return bot.sendMessage(chatId, 'Usage: /broadcast <message>\n(or reply to a message with /broadcast)');

    const targets = Object.keys(connectedUsers);
    if (!targets.length) return bot.sendMessage(chatId, 'No connected users to broadcast to.');

    let ok = 0, fail = 0;
    await bot.sendMessage(chatId, `📣 Broadcasting to ${targets.length} chat(s)...`);
    for (const tid of targets) {
        try {
            await sendWithLinkButtons(tid, text, { disable_web_page_preview: false });
            ok++;
        } catch (e) {
            fail++;
        }
        await new Promise(r => setTimeout(r, 80));
    }
    await bot.sendMessage(chatId, `✅ Broadcast complete.\n• Delivered: ${ok}\n• Failed: ${fail}`);
});

// ==================== /pair (Telegram) ====================
bot.onText(/\/pair$/, async (msg) => {
    const chatId = msg.chat.id;
    const bots = loadTelegramBots();
    if (!bots.length) {
        return bot.sendMessage(chatId, 'No alternative bot deployments registered.');
    }
    const lines = bots.map((b, i) =>
        `*${i + 1}.* ${b.label || b.username}\n   Region: ${b.region || 'Default'}`
    );
    await bot.sendMessage(
        chatId,
        `🤖 *Available Bot Deployments*\n\nEach bot can pair *one* WhatsApp number per Telegram account. If a number is already linked elsewhere, use that bot.\n\n${lines.join('\n\n')}`,
        {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: bots.slice(0, 10).map(b => [{
                    text: `🤖 ${b.label || b.username}`,
                    url: b.link || `https://t.me/${b.username}`
                }])
            }
        }
    );
});

// ==================== Callback handler ====================
bot.on("callback_query", async (query) => {
    const chatId = query.message?.chat?.id;
    const userId = query.from?.id;
    const data = query.data || '';

    if (data.startsWith('copy_')) {
        const code = data.slice(5);
        return bot.answerCallbackQuery(query.id, { text: `Code: ${code}\n(Long-press the code in the message to copy)`, show_alert: true });
    }
    if (data === 'help_connect') {
        await bot.answerCallbackQuery(query.id);
        return bot.sendMessage(chatId,
            `🔗 *How to Connect*\n\n1. Send: \`/connect <number>\`\n   Example: \`/connect 2349074488015\`\n\n2. The bot replies with a pairing code (tap to copy).\n\n3. In WhatsApp → Settings → Linked Devices → Link with phone number → paste the code.\n\n4. Done! Your WA bot is live.\n\nTo disconnect: \`/delsession <number>\``,
            { parse_mode: 'Markdown' }
        );
    }
    if (data === 'show_status' || data === 'show_linked') {
        await bot.answerCallbackQuery(query.id);
        const list = Array.isArray(connectedUsers[chatId]) ? connectedUsers[chatId] : [];
        if (!list.length) return bot.sendMessage(chatId, 'You have no linked WhatsApp numbers. Use /connect <number>.');
        const lines = list.map((u, i) => `${i + 1}. \`${u.phoneNumber}\``);
        return bot.sendMessage(chatId, `📱 *Your Linked Numbers:*\n\n${lines.join('\n')}`, { parse_mode: 'Markdown' });
    }
    if (data === 'show_uptime') {
        await bot.answerCallbackQuery(query.id);
        const s = Math.floor((Date.now() - startTime) / 1000);
        const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
        return bot.sendMessage(chatId, `⏱️ Uptime: ${h}h ${m}m ${s % 60}s`);
    }
    if (data === 'show_owner') {
        await bot.answerCallbackQuery(query.id);
        return bot.sendMessage(chatId, `👤 Owner: ${OWNER_NAME}`);
    }
    if (data === 'show_help') {
        await bot.answerCallbackQuery(query.id);
        return bot.sendMessage(chatId,
`*${BOT_NAME} — Commands*

/start — Main menu
/connect <number> — Link a WhatsApp number
/delsession <number> — Unlink
/status — Linked numbers status
/linked — List linked numbers
/ping — Health check
/uptime — Bot uptime
/owner — Show owner
/pair — Show all bot deployments
/help — This message

_Owner-only:_
/broadcast <message> — Send to all connected users (links auto-convert to buttons)`,
            { parse_mode: 'Markdown' });
    }
    if (data.startsWith('cancel_')) {
        await bot.answerCallbackQuery(query.id, { text: 'You can ignore this code.' });
        return;
    }
    if (data.startsWith('regen_')) {
        await bot.answerCallbackQuery(query.id, { text: 'Send /connect <number> again to regenerate.' });
        return;
    }

    if (data !== "membership_retry") return;

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

keepaliveServer.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.warn(`Keepalive port ${KEEPALIVE_PORT} already in use — skipping.`);
    } else {
        console.error('Keepalive server error:', err.message);
    }
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

