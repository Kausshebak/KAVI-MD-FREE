const { cmd, commands } = require('../command'); // Your command handler
// plugins/ytmp3.js
const { ytmp3 } = require('sadaslk-dlcore');

module.exports = {
  name: "ytmp3",
  description: "Download YouTube audio as MP3",
  command: ["yy", "ytmp3"],
  async execute(conn, msg, args) {
    try {
      if (!args[0]) {
        return conn.sendMessage(msg.from, { text: "Send a YouTube link after the command, e.g. `.song <url>`" }, { quoted: msg });
      }

      const url = args[0];

      const info = await ytmp3(url);

      const caption = `🎵 *${info.title}*\n💾 Size: ${info.size} MB`;

      await conn.sendMessage(
        msg.from,
        {
          audio: { url: info.url },
          mimetype: "audio/mpeg",
          fileName: `${info.title}.mp3`,
          caption,
        },
        { quoted: msg }
      );
    } catch (err) {
      console.error(err);
      conn.sendMessage(msg.from, { text: "Failed to download the YouTube audio." }, { quoted: msg });
    }
  },
};
