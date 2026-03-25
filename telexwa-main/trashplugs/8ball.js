const responses = [
    "Yes, definitely! 🎱",
    "No way! 🎱",
    "Ask again later. 🎱",
    "It is certain. 🎱",
    "Very doubtful. 🎱",
    "Without a doubt. 🎱",
    "My reply is no. 🎱",
    "Signs point to yes. 🎱",
    "Better not tell you now. 🎱",
    "Cannot predict now. 🎱",
    "Concentrate and ask again. 🎱",
    "Don't count on it. 🎱",
    "Most likely! 🎱",
    "Outlook good. 🎱",
    "You may rely on it. 🎱"
];

let trashplug = async (m, { reply, text }) => {
    if (!text) return reply('❓ Please ask a question!\n\nUsage: .8ball <your question>');
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    reply(`🎱 *Magic 8-Ball*\n\n❓ *Question:* ${text}\n\n💬 *Answer:* ${randomResponse}`);
};

trashplug.help = ['8ball <question>'];
trashplug.tags = ['fun'];
trashplug.command = ['8ball'];

module.exports = trashplug;
