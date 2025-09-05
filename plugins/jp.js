const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "yyy",
    react: "🗿",
    fromMe: true,
    desc: "Download YouTube video as document (for large files)",
    catogary: "download"
}, async (message, match) => {
    if (!match) return await message.send('Provide a YouTube URL!');

    const apiUrl = `https://apis-sandarux.zone.id/api/yt/ytdl?url=${encodeURIComponent(match)}`;

    try {
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data || !data.result || !data.result.url) {
            return await message.send('Failed to fetch video.');
        }

        const videoUrl = data.result.url;
        const videoTitle = data.result.title || 'YouTube Video';
        const videoSize = data.result.size || 'Unknown size';

        // Send as document (works for large files)
        await message.sendMessage({
            document: { url: videoUrl },
            mimetype: 'video/mp4',
            fileName: `${videoTitle}.mp4`,
            caption: `🎬 ${videoTitle}\nSize: ${videoSize}`
        });

    } catch (err) {
        console.error(err);
        await message.send('Error downloading the video.');
    }
});
