//Libraries and stuff
const eris = require("eris");
const fs = require("fs");
const utils = require("./utils");
const client = eris(fs.readFileSync("token.txt", {encoding: "utf-8"}), {intents: ["all"]});

//Server variables
const guildId = "1005166532168515594";
const logsId = "1005257755176730654";
const doorId = "1005242907487391893";
const embedColor = 0xfef058;
const memberAvatars = {}

//Essentials variables
const commands = [];

class Command{
    constructor(name, description, run){
        this.name = name;
        this.description = description;
        this.run = run;
    }
}

commands.push({name: "ping", description: "Shows bot latency", async run(msg){
    const ws = client.shards.get(0).ws;
    const ping = await utils.getPing(ws);
    console.log(client.shards.get(0));
    msg.channel.createMessage(`Pong (${ping} ms)`);
}});

commands.push({name: "localtime", description: "Shows the local time in my server location.", run(msg){
    msg.channel.createMessage(`The local time over here is: ${new Date().toLocaleTimeString()}`)
}});

commands.push({name: "bee", description: "Sends an image of a bee.", run(msg){
    const beeFolder = fs.readdirSync("./bees");
    const beeImg = beeFolder[Math.floor(Math.random()*beeFolder.length)];
    const fileName = beeImg;
    const fileBuffer = fs.readFileSync("./bees/" + fileName);
    msg.channel.createMessage("Test", {name: fileName, file: fileBuffer});
}});

commands.push({name: "verify", description: "Use this command to verify.", run(msg){
    if(msg.guildID !== guildId) return;
    var server = client.guilds.get(guildId);
    var member = server.members.get(msg.author.id);
    member.addRole("1005166680013557831").then(async () => {
        (await member.user.getDMChannel()).createMessage("You have been verified.");
    });
    msg.delete();
}});

commands.push({name: "beemovie", description: "Sends a random line from the beemovie.", run(msg){
    const bMovie = fs.readFileSync("beemovie.txt").toString().split("\n");
    const line = bMovie[Math.floor(Math.random()*bMovie.length)];
    msg.channel.createMessage(line);
}});

commands.push({name: "kick", description: "Kicks a member from the current server.", run(msg){
    const member = msg.member;
    if(!member || !member.username) return;
    if(!member.permissions.has("kickMembers")) return msg.channel.createMessage("No.");
    var args = msg.content.split(" ");
    args.shift();
    const toKick = client.guilds.get(msg.guildID).members.get(args[0].replace(/[<@!>]/g, ""));
    if(!toKick) return msg.channel.createMessage("I didn't find that bee");
    if(toKick.id === client.user.id) return msg.channel.createMessage("I'd rather not tbh");
    args.shift();
    const reason = args.join(" ");
    toKick.kick(reason);
}});

commands.push({name: "help", description: "Show a list of commands and what they do.", run(msg){
    var embed = {
        title: "Help",
        description: "Here is a list of commands and what they do:",
        color: embedColor,
        thumbnail: {url: msg.author.avatarURL},
        fields: []
    }
    commands.forEach(cmd => {
        embed.fields.push({name: cmd.name, value: cmd.description});
    });
    msg.channel.createMessage({embed}).catch(console.log);
}});

//Let's hope eris fixed their ready event
client.on("ready", async() => {
    console.log("Ready!");
    client.guilds.get(guildId).members.forEach(async member => {
        memberAvatars[member.id] = {buffer: await utils.getAvatarBuffer(member.avatarURL), url: member.avatarURL};
        const userinfoglobal = JSON.parse(fs.readFileSync("userinfo.json".toString()));
        const userinfo = {messages: 0}
        userinfoglobal[member.id] = userinfo;
        fs.writeFileSync("userinfo.json", JSON.stringify(userinfoglobal));
    });
});

//Commands
client.on("messageCreate", async (msg) => {
    const { prefix } = utils.getConfig();
    const isCommand = msg.content.toLowerCase().startsWith(prefix);
    if(!isCommand) return;
    const cmdName = msg.content.split(" ")[0].replace(prefix, "");
    var found = false;
    commands.forEach(cmd => {
        if(cmd.name === cmdName){
            found = true;
            cmd.run(msg);
        }
    });
    if(!found){
        msg.channel.createMessage("Command was not found.");
    }
});

//Logs: Message delete
client.on("messageDelete", (msg) => {
    const channel = client.getChannel(logsId);
    if(!msg || !msg.author){
        channel.createMessage("Uncached message was deleted.");
        return;
    }
    const embed = {
        title: "Deleted Message",
        description: `${msg.author.username}#${msg.author.discriminator} has deleted a message with contents:\n${msg.content}`,
        color: embedColor,
        thumbnail: {url: msg.avatarURL}
    }
    channel.createMessage({embed});
});


//Logs: Guild member update (nickname and pfp update)
client.on("guildMemberUpdate", async (guild, newM, oldM) => {
    console.log(guild.id, guildId, newM.avatar, oldM.avatar);
    const channel = client.getChannel(logsId);
    if(guild.id !== guildId) return;
    if(memberAvatars[newM.id].url !== newM.avatarURL){
        const newUrl = newM.staticAvatarURL;
        const embed = {
            title: "Profile Picture Change",
            description: `${[newM.username, newM.discriminator].join("#")} has changed their profile picture to ${newUrl}`,
            color: embedColor,
            thumbnail: {url: newUrl}
        }
        channel.createMessage({embed}, [{name: "old.jpg", file: memberAvatars[newM.id].buffer}, {name: "new.jpg", file: await utils.getAvatarBuffer(newM.avatarURL)}]);
        memberAvatars[newM.id] = {url: newM.avatarURL, buffer: await utils.getAvatarBuffer(newM.avatarURL)};
    }
    if(oldM.nick !== newM.nick){
        const embed = {
            title: "Nickname Change",
            description: `${[newM.username, newM.discriminator].join("#")} has changed their nickname from ${oldM.nick || "**default**"} to ${newM.nick || "**default**"}`,
            color: embedColor,
            thumbnail: {url: newM.avatarURL}
        }
        channel.createMessage({embed});
    }
});

//Logs: Message edit
client.on("messageUpdate", (newM, oldM) => {
    const channel = client.getChannel(logsId);
    const embed = {
        title: "Message Edit",
        description: `${[newM.author.username, newM.author.discriminator].join("#")} has updated their message.`,
        fields: [
            {
                name: "From",
                value: oldM.content
            },
            {
                name: "To",
                value: newM.content
            }
        ],
        color: embedColor,
        thumbnail: {url: newM.author.avatarURL}
    }
    channel.createMessage({embed});
});

//Member add
client.on("guildMemberAdd", async (guild, member) => {
    if(guild.id !== guildId) return;
    memberAvatars[member.id] = {url: member.avatarURL, buffer: await utils.getAvatarBuffer(member.avatarURL)}
    const channel = client.getChannel(doorId);
    const embed = {
        title: "New Bee",
        description: `A new bee has entered the hive, please welcome, ${member.username}! :D`,
        color: 0x00FF00,
        thumbnail: {url: member.avatarURL}
    }
    channel.createMessage({embed});
});

//Member leave
client.on("guildMemberRemove", (guild, member) => {
    delete memberAvatars[member.id];
    const channel = client.getChannel(doorId);
    const embed = {
        title: "Bee Has Left",
        description: `${member.username}#${member.discriminator} has left the hive to explore the outside world. o7`,
        color: 0xFF0000,
        thumbnail: {url: member.avatarURL}
    }
    channel.createMessage({embed});
});

//Log the bot into discord
client.connect();