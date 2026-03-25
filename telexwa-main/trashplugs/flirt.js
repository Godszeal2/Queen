const axios = require('axios');

const flirtLines = [
    "You must be a magician because every time I look at you, everyone else disappears. 😍",
    "Do you have a map? I keep getting lost in your eyes. 😏",
    "Is your name Google? Because you have everything I've been searching for. 💫",
    "Are you a camera? Because every time I see you, I smile. 😊",
    "If you were a vegetable, you'd be a cute-cumber. 🥒",
    "Are you a parking ticket? Because you've got 'fine' written all over you. 😉",
    "Do you believe in love at first sight, or should I walk by again? 😜",
    "Are you a time traveler? Because I see you in my future. ❤️",
    "You're so sweet, you're giving me a toothache. 🍬",
    "If looks could kill, you'd be a weapon of mass destruction. 💥",
    "Do you have a Band-Aid? I scraped my knees falling for you. 🩹",
    "Your hand looks heavy — let me hold it for you. 🤝",
    "Are you a star? Because your beauty lights up the room. ✨",
    "If you were a song, you'd be the best one on the album. 🎵",
    "You must be tired because you've been running through my mind all day. 😴"
];

let trashplug = async (m, { reply }) => {
    const line = flirtLines[Math.floor(Math.random() * flirtLines.length)];
    reply(`💕 *Flirt Line*\n\n${line}`);
};

trashplug.help = ['flirt'];
trashplug.tags = ['fun'];
trashplug.command = ['flirt'];

module.exports = trashplug;
