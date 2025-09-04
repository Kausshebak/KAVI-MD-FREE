const { ytmp3 } = require('sadaslk-dlcore');
const { cmd } = require('../command'); // oyage command handler
const fs = require('fs');
const axios = require('axios');
const path = require('path');

cmd({
  pattern: "yy",
  alias: ["ytmp3"],
  desc: "Download YouTube song as MP3",
  category: "download",
  use: ".song <youtube-url or query>",
}, async (conn, m, { args }) => {
  try {
    if (!args[0]) return m.reply("❌ Please provide a YouTube link or search query!");

    let url = args[0];
    m.reply("⏳ Downloading your song, please wait...");

    // Get mp3 data
    const mp3 = await ytmp3(url);
    if (!mp3 || !mp3.download) return m.reply("❌ Failed to fetch download link!");

    // Download audio file
    const filePath = path.join(__dirname, "../temp/" + Date.now() + ".mp3");
    const response = await axios({
      url: mp3.download,
      method: "GET",
      responseType: "arraybuffer"
    });
    fs.writeFileSync(filePath, response.data);

    // Send as audio
    await conn.sendMessage(m.chat, {
      audio: fs.readFileSync(filePath),
      mimetype: "audio/mpeg",
      fileName: `${mp3.title}.mp3`,
    }, { quoted: m });

    fs.unlinkSync(filePath);
  } catch (err) {
    console.error(err);
    m.reply("⚠️ Error: " + err.message);
  }
});
