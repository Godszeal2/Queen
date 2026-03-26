# Queen Abims 👑 Bot

A WhatsApp + Telegram hybrid bot built with Baileys and node-telegram-bot-api.

## Architecture

- **Entry Point**: `telexwa-main/index.js` — Telegram bot + WhatsApp connection manager
- **Command Handler**: `telexwa-main/WhatsApp.js` — Routes all WhatsApp messages and commands
- **Plugins**: `telexwa-main/trashplugs/` — Individual command files (modular plugin system)
- **Bot Restart Wrapper**: `telexwa-main/server.js`
- **Menu**: `telexwa-main/library/listmenu/menulist.js`

## Commands (79 total across 43 plugins)

| Category | Commands |
|---|---|
| AI | .ai, .ask, .gpt, .gemini, .llama, .mixtral, .deepseek, .chatbot on/off |
| Image AI | .imagine, .txt2img, .gen, .ai2img |
| Download | .play (ytmp3), .ytmp4, .apk/.apkdl, .vv (reveal), .vv2 (reveal+DM) |
| Games | .8ball, .truth, .dare, .flirt, .character |
| Fun | .joke, .quote, .fact |
| Anime | .waifu, .neko, .anime |
| Admin | .tagall, .chatbot, .gcstatus, .groupinfo, .setgname, .setgdesc, .setgpp, .addaccess, .delaccess |
| General | .menu, .ping, .alive, .owner, .dev, .repo, .jid |
| Owner | .public, .private, .autoreact, .trash |
| Category Menus | .aimenu, .downloadmenu, .gamemenu, .animemenu, .adminmenu, .generalmenu, .ownermenu |

## Key Dependencies

- `@whiskeysockets/baileys` — WhatsApp Web connection (GitHub fork)
- `node-telegram-bot-api` — Telegram bot
- `gifted-btns` — Interactive WhatsApp buttons
- `yt-search` — YouTube search
- `axios` — HTTP requests

## Configuration

Edit `telexwa-main/config.json`:
- `BOT_TOKEN` — Telegram Bot Token
- `OWNER_ID` — Telegram owner user ID
- `prefix` — Command prefix (default: `.`)

## Running

The workflow `Start application` runs:
```
cd telexwa-main && npm install && node server.js
```

## Changes Made

- **Chatbot AI**: Replaced dead `api.dreaded.site` with DuckDuckGo AI (GPT-4o-mini, free, no auth)
- **New AI Command**: `.ai / .ask / .gpt` powered by DuckDuckGo AI  
- **Buttons**: Added interactive buttons via `gifted-btns` to `.alive`, `.menu`, `.trash` commands
- **Removed viewonce**: The crash/debug function no longer uses viewOnceMessage
- **Fixed fact.js**: Updated to API v2 endpoint
- **Fixed flirt.js**: Removed dead API, expanded to 15 local lines
- **Fixed ytmp4.js**: Now searches YouTube and uses working princetechn.com API
- **Fixed meta.js**: Replaced dead `abella.icu` with DuckDuckGo AI (now .ai/.ask/.gpt)
- **Menu updated**: Shows new AI command section
