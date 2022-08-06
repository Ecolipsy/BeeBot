//Variables and stuff
const eris = require("eris");
const fs = require("fs");
const utils = require("./utils");
const client = eris(fs.readFileSync("token.txt", {encoding: "utf-8"}));

//Let's hope eris fixed their ready event
client.on("ready", () => {
    console.log("Ready!");
});

client.on("messageCreate", async (msg) => {
    const { prefix } = utils.getConfig();
    const isCommand = msg.content.toLowerCase().startsWith(prefix);
    if(!isCommand) return;
    const cmdName = msg.content.split(" ")[0].replace(prefix, "");
    if(cmdName === "ping"){
        const ws = client.shards.get(0).ws;
        const ping = await utils.getPing(ws);
        console.log(client.shards.get(0));
        msg.channel.createMessage(`Pong (${ping} ms)`);
    } else if(cmdName === "localtime"){
        msg.channel.createMessage(`The local time over here is: ${new Date().toLocaleTimeString()}`)
    }
});

client.connect();