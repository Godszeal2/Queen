// Local safe replacement for gifted-btns.
// Renders buttons as a clean text fallback so the message always reaches WhatsApp.

async function sendButtons(sock, jid, opts = {}, extra = {}) {
    const text = String(opts.text || opts.caption || '');
    const footer = opts.footer ? `\n\n_${opts.footer}_` : '';
    const buttons = Array.isArray(opts.buttons) ? opts.buttons : [];

    let buttonsBlock = '';
    if (buttons.length) {
        const lines = buttons.map((b, i) => {
            if (b && b.name === 'cta_url') {
                try {
                    const p = typeof b.buttonParamsJson === 'string'
                        ? JSON.parse(b.buttonParamsJson)
                        : (b.buttonParamsJson || {});
                    return `${i + 1}. ${p.display_text || 'Link'} — ${p.url || ''}`.trim();
                } catch {
                    return `${i + 1}. Link`;
                }
            }
            const label = (b && (b.text || b.displayText || b.title)) || `Option ${i + 1}`;
            const id = (b && (b.id || b.command)) ? ` (.${b.id || b.command})` : '';
            return `${i + 1}. ${label}${id}`;
        });
        buttonsBlock = `\n\n┌──「 Options 」\n│ ${lines.join('\n│ ')}\n└────`;
    }

    const finalText = `${text}${buttonsBlock}${footer}`;
    return sock.sendMessage(jid, { text: finalText }, extra);
}

module.exports = { sendButtons };
