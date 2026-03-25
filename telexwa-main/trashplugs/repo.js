const axios = require('axios');
let trashplug = async (m, {trashcore,reply,trashpic,fkontak}) => {
  try {
    let me = m.sender;
 const ownerName = global.ownername || '𝙂𝙤𝙙𝙨 𝙕𝙚𝙖𝙡 †'
 const approvedNewsletterJid = '120363269950668068@newsletter'
 const response = await axios.get(`https://api.github.com/repos/AiOfLautech/God-s-Zeal-Xmd`)
    if (response.status === 200) {
      const repoData = response.data
      const repos = `
*BOT NAME:*
> ${repoData.name}

*STARS:* 
> ${repoData.stargazers_count}

*FORKS:* 
> ${repoData.forks_count}

*GITHUB LINK:* 
https://github.com/AiOfLautech/God-s-Zeal-Xmd 

@${me.split("@")[0]}👋, check the repo here.

> ${ownerName}`;
trashcore.sendMessage(m.chat, { text : repos,
contextInfo: {
mentionedJid: [m.sender],
forwardingScore: 99, 
isForwarded: true, 
forwardedNewsletterMessageInfo: {
newsletterJid: approvedNewsletterJid,
serverMessageId: 20,
newsletterName: ownerName
},
externalAdReply: {
title: ownerName, 
body: "Repository information",
thumbnail: trashpic, 
sourceUrl: null,
mediaType: 1
}}}, { quoted : fkontak })
    } else {
      await reply(`Failed to fetch repository data!`)
    }
  } catch (error) {
    console.error(error)
    await reply(`Couldn't find repository!`)
  }
};
trashplug.help = ['sc']
trashplug.tags = ['script']
trashplug.command = ['repo']


module.exports = trashplug;
