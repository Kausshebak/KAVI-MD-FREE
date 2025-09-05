const config = require('../config');
const { cmd } = require('../command');
const DY_SCRAP = require('@dark-yasiya/scrap');
const dy_scrap = new DY_SCRAP();

function replaceYouTubeID(url) {
    const regex = /(?:youtube\.com\/(?:.*v=|.*\/)|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

cmd({
    pattern: "yy",
    alias: ["yt", "play"],
    react: "🎵",
    desc: "Download Youtube MP3 / MP4",
    category: "download",
    use: ".song <Text or YT URL>",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return await reply("❌ Please provide a Query or Youtube URL!");

        let id = q.startsWith("https://") ? replaceYouTubeID(q) : null;

        if (!id) {
            const searchResults = await dy_scrap.ytsearch(q);
            if (!searchResults?.results?.length) return await reply("❌ No results found!");
            id = searchResults.results[0].videoId;
        }

        const data = await dy_scrap.ytsearch(`https://youtube.com/watch?v=${id}`);
        if (!data?.results?.length) return await reply("❌ Failed to fetch video!");

        const { url, title, image, timestamp, ago, views, author } = data.results[0];

        let info = `🎥 *KAVI-MD DOWNLOAD* 🎥\n\n` +
            `🏮 *Title:* ${title || "Unknown"}\n` +
            `⏳ *Duration:* ${timestamp || "Unknown"}\n` +
            `👀 *Views:* ${views || "Unknown"}\n` +
            `🌏 *Release Ago:* ${ago || "Unknown"}\n` +
            `👤 *Author:* ${author?.name || "Unknown"}\n` +
            `🖇 *Url:* ${url || "Unknown"}\n\n` +
            `🔢 *_Reply with your choice:-_*\n` +
            `1.1   *Audio Type* 🎵\n` +
            `1.2   *Audio Document* 📁\n` +
            `2.1   *Video Type* 🎬\n` +
            `2.2   *Video Document* 📁\n\n` +
            `${config.FOOTER || "> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴋᴀᴠɪᴅᴜ ʀᴀꜱᴀɴɢᴀ 👨‍💻*"}`;

        const sentMsg = await conn.sendMessage(from, { image: { url: image }, caption: info }, { quoted: mek });
        const messageID = sentMsg.key.id;
        await conn.sendMessage(from, { react: { text: '🎶', key: sentMsg.key } });

        // Listen for reply
        conn.ev.on('messages.upsert', async (messageUpdate) => {
            try {
                const mekInfo = messageUpdate?.messages[0];
                if (!mekInfo?.message) return;

                const messageType = mekInfo?.message?.conversation || mekInfo?.message?.extendedTextMessage?.text;
                const isReplyToSentMsg = mekInfo?.message?.extendedTextMessage?.contextInfo?.stanzaId === messageID;

                if (!isReplyToSentMsg) return;

                let userReply = messageType.trim();
                let msg;
                let type;
                let response;

                if (userReply === "1.1") { // Audio (Voice)
                    msg = await conn.sendMessage(from, { text: "*_🎼 Preparing your audio...⌛_*" }, { quoted: mek });
                    response = await dy_scrap.ytmp3(`https://youtube.com/watch?v=${id}`);
                    let dl = response?.result?.download?.url;
                    if (!dl) return await reply("❌ Audio link not found!");
                    type = { audio: { url: dl }, mimetype: "audio/mpeg" };

                } else if (userReply === "1.2") { // Audio Document
                    msg = await conn.sendMessage(from, { text: "*_🎼 Preparing your audio...⌛_*" }, { quoted: mek });
                    response = await dy_scrap.ytmp3(`https://youtube.com/watch?v=${id}`);
                    let dl = response?.result?.download?.url;
                    if (!dl) return await reply("❌ Audio link not found!");
                    type = { document: { url: dl }, fileName: `${title}.mp3`, mimetype: "audio/mpeg", caption: config.FOOTER };

                } else if (userReply === "2.1") { // Video (Normal)
                    msg = await conn.sendMessage(from, { text: "*_🎬 Preparing your video...⌛_*" }, { quoted: mek });
                    response = await dy_scrap.ytmp4(`https://youtube.com/watch?v=${id}`, { quality: "360p" });
                    let dl = response?.result?.download?.url;
                    if (!dl) return await reply("❌ Video link not found!");
                    type = { video: { url: dl }, mimetype: "video/mp4" };

                } else if (userReply === "2.2") { // Video Document
                    msg = await conn.sendMessage(from, { text: "*_🎬 Preparing your video...⌛_*" }, { quoted: mek });
                    response = await dy_scrap.ytmp4(`https://youtube.com/watch?v=${id}`, { quality: "360p" });
                    let dl = response?.result?.download?.url;
                    if (!dl) return await reply("❌ Video link not found!");
                    type = { document: { url: dl }, fileName: `${title}.mp4`, mimetype: "video/mp4", caption: config.FOOTER };

                } else {
                    return await reply("❌ Invalid choice! Reply with 1.1, 1.2, 2.1 or 2.2.");
                }

                await conn.sendMessage(from, type, { quoted: mek });
                await conn.sendMessage(from, { text: '*_Your request upload successful ☑️_*', edit: msg.key });

            } catch (error) {
                console.error(error);
                await reply(`❌ *An error occurred while processing:* ${error.message || "Error!"}`);
            }
        });

    } catch (error) {
        console.error(error);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        await reply(`❌ *An error occurred:* ${error.message || "Error!"}`);
    }
});
