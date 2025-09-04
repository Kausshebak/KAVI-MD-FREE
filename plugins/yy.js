const { cmd, commands } = require('../command'); // Your command handler
const { ytmp3, ytmp4, tiktok, facebook, instagram, twitter } = require('sadaslk-dlcore');

cmd({
    pattern: 'download ?(.*)',
    fromMe: true, // true if only bot owner can use
    desc: 'Download media from YouTube, TikTok, Facebook, Instagram, Twitter',
    type: 'download',
    async handler(message, match) {
        if (!match) return await message.reply('Please provide a URL.');

        let url = match.trim();
        let result;

        try {
            if (url.includes('youtube.com') || url.includes('youtu.be')) {
                // YouTube MP3
                result = await ytmp3(url);
                await message.sendMessage({
                    audio: { url: result.url },
                    mimetype: 'audio/mpeg',
                    fileName: `${result.title}.mp3`
                });
            } else if (url.includes('facebook.com')) {
                result = await facebook(url);
                await message.sendMessage({
                    video: { url: result.url },
                    mimetype: 'video/mp4',
                    fileName: `${result.title}.mp4`
                });
            } else if (url.includes('tiktok.com')) {
                result = await tiktok(url);
                await message.sendMessage({
                    video: { url: result.url },
                    mimetype: 'video/mp4',
                    fileName: `${result.author}.mp4`
                });
            } else if (url.includes('instagram.com')) {
                result = await instagram(url);
                await message.sendMessage({
                    video: { url: result.url },
                    mimetype: 'video/mp4',
                    fileName: `${result.username}.mp4`
                });
            } else if (url.includes('twitter.com')) {
                result = await twitter(url);
                await message.sendMessage({
                    video: { url: result.url },
                    mimetype: 'video/mp4',
                    fileName: `${result.username}.mp4`
                });
            } else {
                return await message.reply('Unsupported URL.');
            }
        } catch (e) {
            console.error(e);
            await message.reply('Failed to download media. Maybe the URL is invalid or unsupported.');
        }
    }
});
