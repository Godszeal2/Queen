const axios = require('axios');

let trashplug = async (m, { reply }) => {
    try {
        const res = await axios.get('https://api.quotable.io/random');
        reply(`💬 *Quote*\n\n_"${res.data.content}"_\n\n— *${res.data.author}*`);
    } catch {
        const quotes = [
            { q: "The only way to do great work is to love what you do.", a: "Steve Jobs" },
            { q: "Life is what happens when you're busy making other plans.", a: "John Lennon" },
            { q: "The future belongs to those who believe in the beauty of their dreams.", a: "Eleanor Roosevelt" },
            { q: "Be the change you wish to see in the world.", a: "Mahatma Gandhi" }
        ];
        const r = quotes[Math.floor(Math.random() * quotes.length)];
        reply(`💬 *Quote*\n\n_"${r.q}"_\n\n— *${r.a}*`);
    }
};

trashplug.help = ['quote'];
trashplug.tags = ['general'];
trashplug.command = ['quote'];

module.exports = trashplug;
