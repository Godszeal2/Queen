const axios = require('axios');
const yts = require('yt-search');

let trashplug = async (m, { text, trashcore, fkontak, reply }) => {
  try {
    if (!text) {
      return reply('*Example:* .play Only We Know Speed Up');
    }

    let videoUrl = text.trim();
    let video;

    // If input is not a YouTube link, search by name
    const isYouTubeUrl = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(videoUrl);

    if (!isYouTubeUrl) {
      const searchResult = await yts(videoUrl);
      video = searchResult.videos[0];

      if (!video) {
        return reply('*No result found.*');
      }

      videoUrl = video.url;
    } else {
      // If user sends a direct YouTube link, still fetch metadata for thumbnail/title
      const searchResult = await yts({ videoId: extractVideoId(videoUrl) });
      video = searchResult;
    }

    const apiUrl = `https://api.princetechn.com/api/download/ytmp3?apikey=prince&url=${encodeURIComponent(videoUrl)}`;

    const { data } = await axios.get(apiUrl, {
      headers: { Accept: 'application/json' }
    });

    const result = data.result || data;

    const audioUrl =
      result.download_url ||
      result.url ||
      result.audio ||
      result.audio_url ||
      result.download ||
      result.link;

    const title =
      result.title ||
      video?.title ||
      'YouTube Audio';

    const thumbnail =
      result.thumbnail ||
      result.thumbnail_url ||
      video?.thumbnail ||
      null;

    if (!audioUrl) {
      return reply('*Failed to get audio link from API.*');
    }

    await trashcore.sendMessage(
      m.chat,
      {
        audio: { url: audioUrl },
        mimetype: 'audio/mpeg',
        ptt: false,
        contextInfo: {
          externalAdReply: {
            title,
            body: video?.author?.name || result.author || 'YouTube MP3',
            thumbnailUrl: thumbnail,
            sourceUrl: videoUrl,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      },
      { quoted: fkontak }
    );

  } catch (e) {
    console.error(e);
    reply(`Error: ${e.message}`);
  }
};

function extractVideoId(url) {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

trashplug.help = ['play'];
trashplug.tags = ['play'];
trashplug.command = ['play'];

module.exports = trashplug;
