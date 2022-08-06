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
    }
}