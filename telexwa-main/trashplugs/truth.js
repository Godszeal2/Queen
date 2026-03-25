const axios = require('axios');

const truths = [
    "What is the most embarrassing thing you've ever done?",
    "What is your biggest fear?",
    "Have you ever lied to your best friend? What was the lie?",
    "Who was your first crush?",
    "What is the most childish thing you still do?",
    "Have you ever cheated on a test?",
    "What is something you would never want your parents to know?",
    "What is your biggest insecurity?",
    "Have you ever stolen something?",
    "What is your worst habit?"
];

let trashplug = async (m, { reply }) => {
    try {
        const res = await axios.get('https://api.dreaded.site/api/truth');
        const truth = res.data?.result || res.data?.truth;
        if (!truth || typeof truth !== 'string') throw new Error('No result');
        reply(`🔮 *Truth*\n\n${truth}`);
    } catch {
        const truth = truths[Math.floor(Math.random() * truths.length)];
        reply(`🔮 *Truth*\n\n${truth}`);
    }
};

trashplug.help = ['truth'];
trashplug.tags = ['game'];
trashplug.command = ['truth'];

module.exports = trashplug;
