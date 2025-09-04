const { ytmp3 } = require('sadaslk-dlcore');
const { cmd, commands } = require('../command'); // your command handler
const fs = require('fs');
const axios = require('axios');
const path = require('path');

cmd({
  pattern: "yy",
  desc: "Download YouTube song as MP3",
  category: "Download",
  react: "😒",
  use: ".song <YouTube URL or query>"
}, async (conn, m, { args }) => {
  try {
    if (!args[0]) return m.reply("❌ Please provide a YouTube URL!");

    const url = args[0];
    m.reply("⏳ Downloading your song...");

    const mp3 = await ytmp3(url);
    if (!mp3 || !mp3.download) return m.reply("❌ Failed to get download link.");

    // Download the audio
    const tempPath = path.join(__dirname, "../temp", Date.now() + ".mp3");
    const response = await axios.get(mp3.download, { responseType: "arraybuffer" });
    fs.writeFileSync(tempPath, response.data);

    // Send audio to WhatsApp
    await conn.sendMessage(m.chat, {
      audio: fs.readFileSync(tempPath),
      mimetype: "audio/mpeg",
      fileName: `${mp3.title}.mp3`
    }, { quoted: m });

    // Delete temp file
    fs.unlinkSync(tempPath);

  } catch (err) {
    console.error(err);
    m.reply("⚠️ Error: " + err.message);
  }
});
