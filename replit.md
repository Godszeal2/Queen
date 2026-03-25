# Queen Abims 👑 Bot

A WhatsApp + Telegram hybrid bot built with Baileys and node-telegram-bot-api.

## Architecture

- **Entry Point**: `telexwa-main/index.js` — Telegram bot + WhatsApp connection manager
- **Command Handler**: `telexwa-main/WhatsApp.js` — Routes all WhatsApp messages and commands
- **Plugins**: `telexwa-main/trashplugs/` — Individual command files (modular plugin system)
- **Bot Restart Wrapper**: `telexwa-main/server.js`
- **Menu**: `telexwa-main/library/listmenu/menulist.js`

## Commands

| Category | Commands |
|---|---|
| General | .menu, .ping, .alive, .joke, .quote, .fact, .jid, .dev, .repo |
| AI | .ai, .ask, .gpt (DuckDuckGo AI), .chatbot on/off |
| Games | .8ball, .truth, .dare, .flirt, .character |
| Admin | .tagall, .chatbot, .gcstatus, .groupinfo, .setgname, .setgdesc, .setgpp |
| Media | .play (ytmp3), .ytmp4 |
| Owner | .public, .private, .autoreact, .addaccess, .delaccess, .trash |

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
