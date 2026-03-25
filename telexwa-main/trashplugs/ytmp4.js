const axios = require('axios');
const yts = require('yt-search');

let trashplug = async (m, { text, trashcore, reply }) => {
  if (!text) return reply('provide a YouTube URL or search term!\n\nUse: .ytmp4 https://youtube.com/watch?v=xxxx\nOr: .ytmp4 Never Gonna Give You Up');

  let url = text.trim().split(' ')[0];

  try {
    const isYouTubeUrl = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(url);
    let video;

    if (!isYouTubeUrl) {
      const searchResult = await yts(url);
      video = searchResult.videos[0];
      if (!video) return reply('❌ *No results found.*\n\nTry a different search term.');
      url = video.url;
    } else {
      const idMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
      if (idMatch) {
        const search = await yts({ videoId: idMatch[1] });
        video = search;
      }
    }

    const title = video?.title || 'YouTube Video';
    const thumbnail = video?.thumbnail || `https://img.youtube.com/vi/${url.match(/[a-zA-Z0-9_-]{11}/)?.[0]}/hqdefault.jpg`;
    const channel = video?.author?.name || video?.channel || 'YouTube';

    await reply(`⏳ *Fetching video...*\n\n📌 *Title:* ${title}\n📺 *Channel:* ${channel}\n\n_Please wait..._`);

    const apiUrl = `https://api.princetechn.com/api/download/ytmp4?apikey=prince&url=${encodeURIComponent(url)}`;
    const { data } = await axios.get(apiUrl, { headers: { Accept: 'application/json' }, timeout: 30000 });
    const result = data.result || data;

    const videoUrl = result.download_url || result.url || result.video || result.video_url || result.link;

    if (!videoUrl) return reply('❌ *Failed to get video link.*\n\nTry again or use a different URL.');

    await trashcore.sendMessage(m.chat, {
      video: { url: videoUrl },
      mimetype: 'video/mp4',
      fileName: `${title.slice(0, 50)}.mp4`,
      caption: `✅ *Video Downloaded!*\n\n📌 *Title:* ${title}\n📺 *Channel:* ${channel}\n\n> Powered by Qᴜᴇᴇɴ ᴀʙɪᴍꜱ 👑`,
      contextInfo: {
        externalAdReply: {
          title,
          body: channel,
          thumbnailUrl: thumbnail,
          sourceUrl: url,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m });

  } catch (err) {
    console.error('ytmp4 error:', err.message);
    reply(`❌ *Error:* ${err.message}\n\nMake sure the YouTube link is valid and try again.`);
  }
};
trashplug.help = ['ytmp4']
trashplug.tags = ['ytmp4']
trashplug.command = ['ytmp4']


module.exports = trashplug;