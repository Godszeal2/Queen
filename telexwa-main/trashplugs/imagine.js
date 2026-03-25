const axios = require('axios');

async function generateWithPollinations(prompt) {
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&model=flux`;
    const res = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 60000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    if (!res.data || res.data.byteLength < 1000) throw new Error('Empty response');
    return Buffer.from(res.data);
}

async function generateWithPollinations2(prompt) {
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=turbo&nologo=true`;
    const res = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 45000
    });
    if (!res.data || res.data.byteLength < 1000) throw new Error('Empty response');
    return Buffer.from(res.data);
}

let trashplug = async (m, { text, trashcore, reply }) => {
    if (!text) {
        return reply(`🎨 *AI Image Generator*\n\n*Usage:* .imagine <description>\n\n*Examples:*\n• .imagine beautiful sunset over mountains\n• .imagine futuristic city at night anime style\n• .imagine portrait of a queen in golden armor\n\n_Powered by AI — generates unique art from your words!_`);
    }

    const prompt = text.trim();
    if (prompt.length < 3) return reply('❌ Please provide a more detailed description!');

    await reply(`🎨 *Generating your image...*\n\n📝 *Prompt:* ${prompt}\n\n_Please wait, this may take 10-30 seconds..._`);

    const errors = [];

    try {
        const imgBuffer = await generateWithPollinations(prompt);
        await trashcore.sendMessage(m.chat, {
            image: imgBuffer,
            caption: `🖼️ *AI Generated Image*\n\n📝 *Prompt:* ${prompt}\n\n> ✨ Powered by 『 Qᴜᴇᴇɴ ᴀʙɪᴍꜱ 👑 』`
        }, { quoted: m });
        return;
    } catch (e) {
        errors.push('Model 1: ' + e.message);
    }

    try {
        const imgBuffer = await generateWithPollinations2(prompt);
        await trashcore.sendMessage(m.chat, {
            image: imgBuffer,
            caption: `🖼️ *AI Generated Image*\n\n📝 *Prompt:* ${prompt}\n\n> ✨ Powered by 『 Qᴜᴇᴇɴ ᴀʙɪᴍꜱ 👑 』`
        }, { quoted: m });
        return;
    } catch (e) {
        errors.push('Model 2: ' + e.message);
    }

    reply(`❌ *Image generation failed.*\n\nPlease try again with a different prompt.\n\n_Errors: ${errors.join(', ')}_`);
};

trashplug.help = ['imagine <prompt>'];
trashplug.tags = ['ai'];
trashplug.command = ['imagine', 'txt2img', 'gen', 'ai2img'];

module.exports = trashplug;
