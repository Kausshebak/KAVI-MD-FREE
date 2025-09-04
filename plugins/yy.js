const { ytmp3 } = require('sadaslk-dlcore');
const { cmd } = require('../command'); // your command handler
const fs = require('fs');
const axios = require('axios');
const path = require('path');

// Ensure temp folder exists
const tempDir = path.join(__dirname, "../temp");
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

cmd({
  pattern: "yy",
  desc: "Download YouTube song as MP3",
  category: "Download",
  use: ".song <YouTube URL>"
}, async (conn, m, { args }) => {
  try {
    // Check args safely
    if (!args || !args[0]) return m.reply("❌ Please provide a YouTube URL!");

    const url = args[0].trim();
    m.reply("⏳ Downloading your song...");

    // Fetch mp3 info
    const mp3 = await ytmp3(url);
    if (!mp3 || !mp3.download) return m.reply("❌ Failed to get download link.");

    // Download audio file
    const filePath = path.join(tempDir, `${Date.now()}.mp3`);
    const response = await axios.get(mp3.download, { responseType: "arraybuffer" });
    fs.writeFileSync(filePath, response.data);

    // Send audio to WhatsApp
    await conn.sendMessage(m.chat, {
      audio: fs.readFileSync(filePath),
      mimetype: "audio/mpeg",
      fileName: `${mp3.title}.mp3`
    }, { quoted: m });

    // Delete temp file
    fs.unlinkSync(filePath);

  } catch (err) {
    console.error(err);
    m.reply("⚠️ Error: " + err.message);
  }
});
