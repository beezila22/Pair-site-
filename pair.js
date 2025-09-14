const { makeid } = require('./gen-id');
const express = require('express');
const fs = require('fs');
let router = express.Router();
const pino = require("pino");
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    Browsers,
    makeCacheableSignalKeyStore
} = require('@whiskeysockets/baileys');

const { upload } = require('./mega');

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

// Makima-themed Pair Endpoint
router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;

    async function MAKIMA_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);

        try {
            var browsers = ["Safari", "Firefox", "Chrome"];
            function selectRandomItem(array) {
                var randomIndex = Math.floor(Math.random() * array.length);
                return array[randomIndex];
            }
            var randomBrowser = selectRandomItem(browsers);

            let sock = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                generateHighQualityLinkPreview: true,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                syncFullHistory: false,
                browser: Browsers.macOS(randomBrowser)
            });

            if (!sock.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await sock.requestPairingCode(num);
                if (!res.headersSent) {
                    await res.send({ code });
                }
            }

            sock.ev.on('creds.update', saveCreds);

            sock.ev.on("connection.update", async (update) => {
                const { connection, lastDisconnect } = update;

                if (connection === "open") {
                    await delay(5000);
                    let credsPath = __dirname + `/temp/${id}/creds.json`;
                    let data = fs.readFileSync(credsPath);

                    function generateMakimaID() {
                        const prefix = "MK";
                        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                        let makimaID = prefix;
                        for (let i = prefix.length; i < 22; i++) {
                            const randomIndex = Math.floor(Math.random() * characters.length);
                            makimaID += characters.charAt(randomIndex);
                        }
                        return makimaID;
                    }

                    const makimaID = generateMakimaID();

                    try {
                        const mega_url = await upload(fs.createReadStream(credsPath), `${sock.user.id}.json`);
                        const string_session = mega_url.replace('https://mega.nz/file/', '');
                        let session_code = "makima~" + string_session;

                        // Send Makima Session ID to user
                        let sentCode = await sock.sendMessage(sock.user.id, { text: session_code });

                        let desc = `*Greetings Darling!* 🩸

Your *Silatrix Session* has been created successfully.  

🔮 *Silatrix ID:* Sent above  
⚠️ *Handle with care!* Sharing this may compromise your session.  

——————  

*📢 Join the Command:*  
Follow Silatrix’s directives here:  
https://whatsapp.com/channel/0029Vb6DeKwCHDygxt0RXh0L  

*🌀 Source Code:*  
Explore and modify your own path:  
https://github.com/silatrix2/SILATRIX-XMD  

——————  

> *© Silatrix Authority*  
Stay sharp, stay obedient. 👁️`;

                        await sock.sendMessage(sock.user.id, {
                            text: desc,
                            contextInfo: {
                                externalAdReply: {
                                    title: "🩸 Silatrix — Official Pair",
                                    thumbnailUrl: "https://files.catbox.moe/x8vle8.jpg",
                                    sourceUrl: "https://whatsapp.com/channel/0029Vb6DeKwCHDygxt0RXh0L",
                                    mediaType: 1,
                                    renderLargerThumbnail: true
                                }
                            }
                        }, { quoted: sentCode });

                    } catch (e) {
                        let errorMsg = await sock.sendMessage(sock.user.id, { text: e.toString() });
                        let desc = `*Greetings Darling!* 🩸

Your *Silatrix Session* has been created, despite minor issues.  

🔮 *Silatrix ID:* Sent above  
⚠️ *Handle with care!*  

——————  

*📢 Join the Command:*  
Follow Makima’s directives here:  
https://whatsapp.com/channel/0029Vb6DeKwCHDygxt0RXh0L  

*🌀 Source Code:*  
Explore and modify your own path:  
https://github.com/Silatrix/SILATRIX-XMD 

——————  

> *© Silatrix Authority*  
Stay sharp, stay obedient. 👁️`;

                        await sock.sendMessage(sock.user.id, {
                            text: desc,
                            contextInfo: {
                                externalAdReply: {
                                    title: "🩸 Silatrix — Official Pair",
                                    thumbnailUrl: "https://i.imgur.com/GVW7aoD.jpeg",
                                    sourceUrl: "https://whatsapp.com/channel/0029Vb6DeKwCHDygxt0RXh0L",
                                    mediaType: 2,
                                    renderLargerThumbnail: true,
                                    showAdAttribution: true
                                }
                            }
                        }, { quoted: errorMsg });
                    }

                    await delay(10);
                    await sock.ws.close();
                    await removeFile('./temp/' + id);
                    console.log(`👤 ${sock.user.id} 🩸 Silatrix Session Connected ✅ Restarting process...`);
                    await delay(10);
                    process.exit();

                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                    await delay(10);
                    SILATRIX_PAIR_CODE();
                }
            });

        } catch (err) {
            console.log("⚠️ Connection failed — Restarting service...");
            await removeFile('./temp/' + id);
            if (!res.headersSent) {
                await res.send({ code: "❗ Silatrix Gate Closed (Service Unavailable)" });
            }
        }
    }

    return await SILATRIX_PAIR_CODE();
});

module.exports = router;
