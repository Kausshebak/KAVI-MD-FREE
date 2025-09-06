const config = require('../config');
const { cmd } = require('../command');
const savetube = require('../lib/savetube');

cmd({
    pattern: "yo",
    alias: ["ytmp3", "ytmp4", "youtube"],
    desc: "Download YouTube videos or audios",
    category: "downloader",
    react: "🎥",
    filename: __filename
}, async (conn, mek, m, { args }) => {
    try {
        if (!args[0]) return m.reply("❌ Please give me a YouTube link\n\nUsage: *.yt <url> <format>*\nFormats: mp3, 144, 240, 360, 480, 720, 1080");

        const url = args[0];
        const format = args[1] || "mp3"; // default mp3

        let res = await savetube.download(url, format);

        if (!res.status) return m.reply("⚠️ " + res.error);

        const data = res.response;

        let caption = `📥 *YouTube Downloader*\n\n`;
        caption += `📌 Title: ${data.title}\n`;
        caption += `🎞 Format: ${data.format}\n`;
        caption += `⏳ Duration: ${data.duration}\n`;
        caption += `📺 Type: ${data.type}\n\n`;
        caption += `🔗 *Download:* ${data.download}`;

        // if small size, send direct media
        if (data.type === "audio" || format === "mp3") {
            await conn.sendMessage(m.chat, {
                audio: { url: data.download },
                mimetype: "audio/mpeg"
            }, { quoted: mek });
        } else {
            await conn.sendMessage(m.chat, {
                video: { url: data.download },
                mimetype: "video/mp4",
                caption
            }, { quoted: mek });
        }

    } catch (e) {
        m.reply("❌ Error: " + e.message);
    }
});
