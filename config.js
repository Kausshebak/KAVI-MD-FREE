const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {
SESSION_ID: process.env.SESSION_ID || "3FchyZSB#ZRXPnEDQmrJxtE2wc-pCLlraHLUg47_fryHEmI16Zk0", // ඔයාගෙ session id එක
MONGODB: process.env.MONGODB || "mongodb://mongo:TdlccGBRitoynUsOmnyGJwfFwCVhdBbd@nozomi.proxy.rlwy.net:35163",
};
