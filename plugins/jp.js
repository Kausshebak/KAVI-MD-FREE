
const axios = require("axios");
const { cmd } = require("../command");

cmd({
  pattern: "pixeldrain",
  alias: ["pd"],
  desc: "Download Pixeldrain files (small → WhatsApp, large → link)",
  category: "download",
  use: ".pixeldrain <link>"
}, async (conn, mek, m, { args }) => {
  try {
    if (!args[0]) return m.reply("📌 Use: .pixeldrain <pixeldrain-link>");

    let url = args[0];
    let fileId = null;

    if (url.includes("pixeldrain.com/u/")) {
      fileId = url.split("pixeldrain.com/u/")[1].split(/[/?]/)[0];
    } else if (/^[a-zA-Z0-9]+$/.test(url)) {
      fileId = url;
    } else {
      return m.reply("❌ Invalid Pixeldrain link or ID!");
    }

    // Get file info from Pixeldrain API
    const apiUrl = `https://pixeldrain.com/api/file/${fileId}/info`;
    const { data } = await axios.get(apiUrl);

    if (!data || !data.name) return m.reply("❌ Could not fetch file info!");

    let fileName = data.name;
    let sizeMB = (data.size / (1024 * 1024)).toFixed(2);
    let sizeText = sizeMB + " MB";

    if (sizeMB <= 95) {
      // small file → WhatsApp
      m.reply(`📂 *File Found!*\n📌 Name: ${fileName}\n📦 Size: ${sizeText}\n⬇️ Downloading...`);
      const fileUrl = `https://pixeldrain.com/api/file/${fileId}`;
      const response = await axios.get(fileUrl, { responseType: "arraybuffer" });

      await conn.sendMessage(m.chat, {
        document: Buffer.from(response.data),
        mimetype: data.mime_type || "application/octet-stream",
        fileName: fileName
      }, { quoted: mek });

    } else {
      // large file → Direct link
      m.reply(`📂 *File Found!*\n📌 Name: ${fileName}\n📦 Size: ${sizeText}\n⚠️ File too large for WhatsApp.\n\n🔗 Direct Download: https://pixeldrain.com/api/file/${fileId}`);
    }

  } catch (e) {
    console.error(e);
    m.reply("❌ Error downloading Pixeldrain file!");
  }
});
