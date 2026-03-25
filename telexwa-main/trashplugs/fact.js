const axios = require('axios');

const fallbackFacts = [
    "Honey never spoils. Archaeologists have found 3,000-year-old honey in Egyptian tombs that was still edible.",
    "A group of flamingos is called a flamboyance.",
    "Octopuses have three hearts and blue blood.",
    "The Eiffel Tower can grow up to 6 inches taller in summer due to the expansion of the iron.",
    "Wombat droppings are cube-shaped — the only known cubic animal droppings in the world.",
    "A snail can sleep for 3 years without eating.",
    "Bananas are technically berries, but strawberries are not.",
    "There are more possible chess games than atoms in the observable universe.",
    "Hot water can freeze faster than cold water — known as the Mpemba effect.",
    "The unicorn is the national animal of Scotland."
];

let trashplug = async (m, { reply }) => {
    try {
        const response = await axios.get('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en', { timeout: 8000 });
        const fact = response.data.text;
        reply(`💡 *Random Fact*\n\n${fact}`);
    } catch (error) {
        const f = fallbackFacts[Math.floor(Math.random() * fallbackFacts.length)];
        reply(`💡 *Random Fact*\n\n${f}`);
    }
};

trashplug.help = ['fact'];
trashplug.tags = ['general'];
trashplug.command = ['fact'];

module.exports = trashplug;
