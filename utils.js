const https = require("https");

const DISCORD_EPOCH = 1420070400000;

module.exports = {
    getPing(ws){
        return new Promise((resolve, reject) => {
            const before = Date.now();
            ws.ping();
            ws.once("pong", () => {
                const after = Date.now();
                resolve(after-before);
            });
        });
    },
    getConfig(){
        delete require.cache[require.resolve("./config.json")];
        return require("./config.json");
    },
    getAvatarBuffer(url){
        return new Promise((resolve, reject) => {
            https.request(url, (res) => {
                var end = Buffer.from("");
                res.on("data", (d) => {
                    end = Buffer.concat([end, d]);
                });
                res.on("end", () => {
                    resolve(end);
                });
                res.on("error", reject);
            }).end();
        });
    },
    idToDate(snowflake) {
        return new Date(snowflake / 4194304 + DISCORD_EPOCH);
    }
}