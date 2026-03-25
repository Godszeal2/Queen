const axios = require('axios');

let trashplug = async (m, { reply }) => {
    try {
        const res = await axios.get('https://official-joke-api.appspot.com/random_joke');
        const { setup, punchline } = res.data;
        reply(`😂 *Joke*\n\n${setup}\n\n${punchline}`);
    } catch {
        const jokes = [
            { s: "Why don't scientists trust atoms?", p: "Because they make up everything! 😂" },
            { s: "Why did the scarecrow win an award?", p: "Because he was outstanding in his field! 🌾" },
            { s: "Why don't eggs tell jokes?", p: "They'd crack each other up! 🥚" },
            { s: "What do you call fake spaghetti?", p: "An impasta! 🍝" }
        ];
        const j = jokes[Math.floor(Math.random() * jokes.length)];
        reply(`😂 *Joke*\n\n${j.s}\n\n${j.p}`);
    }
};

trashplug.help = ['joke'];
trashplug.tags = ['fun'];
trashplug.command = ['joke'];

module.exports = trashplug;
