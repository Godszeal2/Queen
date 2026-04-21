// Maps a wide range of fancy/styled Unicode letters back to plain ASCII
// so commands like ".𝓶𝓮𝓷𝓾", ".ᴍᴇɴᴜ", ".🅼🅴🅽🆄" still resolve to "menu".

const map = {};

function add(rangeStart, target) {
    for (let i = 0; i < 26; i++) {
        map[String.fromCodePoint(rangeStart + i)] = String.fromCharCode(target.charCodeAt(0) + i);
    }
}

// Mathematical / fancy letter ranges (a-z and A-Z) from Unicode block
// "Mathematical Alphanumeric Symbols" + look-alikes
const lowerRanges = [
    0x1D41A, 0x1D44E, 0x1D482, 0x1D4B6, 0x1D4EA, 0x1D51E, 0x1D552,
    0x1D586, 0x1D5BA, 0x1D5EE, 0x1D622, 0x1D656, 0x1D68A
];
const upperRanges = [
    0x1D400, 0x1D434, 0x1D468, 0x1D49C, 0x1D4D0, 0x1D504, 0x1D538,
    0x1D56C, 0x1D5A0, 0x1D5D4, 0x1D608, 0x1D63C, 0x1D670
];
lowerRanges.forEach(s => add(s, 'a'));
upperRanges.forEach(s => add(s, 'A'));

// Small caps & smallcaps-like
const smallCaps = 'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀꜱᴛᴜᴠᴡxʏᴢ';
for (let i = 0; i < smallCaps.length; i++) {
    map[smallCaps[i]] = String.fromCharCode('a'.charCodeAt(0) + i);
}
// Fullwidth letters
for (let i = 0; i < 26; i++) {
    map[String.fromCharCode(0xFF41 + i)] = String.fromCharCode('a'.charCodeAt(0) + i);
    map[String.fromCharCode(0xFF21 + i)] = String.fromCharCode('A'.charCodeAt(0) + i);
}
// Enclosed alphanumerics (circled letters)
for (let i = 0; i < 26; i++) {
    map[String.fromCharCode(0x24D0 + i)] = String.fromCharCode('a'.charCodeAt(0) + i); // ⓐ-ⓩ
    map[String.fromCharCode(0x24B6 + i)] = String.fromCharCode('A'.charCodeAt(0) + i); // Ⓐ-Ⓩ
}
// Squared / negative squared
for (let i = 0; i < 26; i++) {
    map[String.fromCodePoint(0x1F130 + i)] = String.fromCharCode('A'.charCodeAt(0) + i); // 🄰-🅉
    map[String.fromCodePoint(0x1F170 + i)] = String.fromCharCode('A'.charCodeAt(0) + i); // 🅐-🅩
    map[String.fromCodePoint(0x1F1E6 + i)] = String.fromCharCode('A'.charCodeAt(0) + i); // 🇦-🇿 regional
}

// Fullwidth digits
for (let i = 0; i < 10; i++) {
    map[String.fromCharCode(0xFF10 + i)] = String.fromCharCode('0'.charCodeAt(0) + i);
}
// Mathematical bold/italic digits
const digitStarts = [0x1D7CE, 0x1D7D8, 0x1D7E2, 0x1D7EC, 0x1D7F6];
digitStarts.forEach(s => {
    for (let i = 0; i < 10; i++) map[String.fromCodePoint(s + i)] = String.fromCharCode('0'.charCodeAt(0) + i);
});

function normalizeText(input) {
    if (typeof input !== 'string') return input;
    let out = '';
    // Iterate by code point so surrogate-pair fancy chars are handled
    for (const ch of input) {
        out += (map[ch] !== undefined) ? map[ch] : ch;
    }
    return out;
}

module.exports = { normalizeText };
