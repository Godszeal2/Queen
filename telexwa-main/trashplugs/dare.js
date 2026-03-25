const axios = require('axios');

const dares = [
    "Call someone you haven't talked to in a while and sing them a song.",
    "Do your best impression of a celebrity for 30 seconds.",
    "Text your crush 'I think about you a lot' and show everyone their reply.",
    "Let someone else post a status on your behalf.",
    "Do 20 push-ups right now.",
    "Speak in an accent for the next 3 rounds.",
    "Send a voice note of you saying 'I love you' to the last person you texted.",
    "Change your profile picture to whatever someone tells you for 1 hour.",
    "Tell everyone your most embarrassing moment.",
    "Post a throwback photo from 5 years ago."
];

let trashplug = async (m, { reply }) => {
    try {
        const res = await axios.get('https://api.dreaded.site/api/dare');
        const dare = res.data?.result || res.data?.dare;
        if (!dare || typeof dare !== 'string') throw new Error('No result');
        reply(`🎯 *Dare*\n\n${dare}`);
    } catch {
        const dare = dares[Math.floor(Math.random() * dares.length)];
        reply(`🎯 *Dare*\n\n${dare}`);
    }
};

trashplug.help = ['dare'];
trashplug.tags = ['game'];
trashplug.command = ['dare'];

module.exports = trashplug;
