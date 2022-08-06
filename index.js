//Requirements and instance creation
const { Client, Intents, MessageEmbed } = require("discord.js");
const fs = require("fs");
const flags = Intents.FLAGS;
const client = new Client({intents: [flags.GUILD_MESSAGES, flags.GUILD_MEMBERS], ws: {properties: {browser: "Chrome", device: "iPhone", os: "iOS"}}});
const cmdHandler = require("./CommandHandler");

//Essential variables
const guildId = "1005166532168515594";
const doorId = "1005242907487391893";
const logsId = "1005257755176730654";

//Essential functions
function cacheChannel(id){
    return client.channels.fetch(id);
}
function sleep(ms){
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}

//Ready event
client.on("ready", () => {
    console.log("Ready!");
    cmdHandler.setClient(client);
    cmdHandler.load();
    //In a setInterval because stinky discord.js is very buggy at this version, which is also the same reason the name is written twice
    setInterval(() => {
        const name = "over The Beehive";
        client.user.setActivity(name, {type: "WATCHING", name});
    }, 1500);
    client.guilds.cache.get(guildId).members.cache.forEach(member => {
        member.roles.add("1005166680013557831");
    });
});

//Interaction event
client.on("interactionCreate", (int) => {
    //Command event
    if(int.isCommand()){
        cmdHandler.handleInteraction(int);
        return;
    }
});

//Member Join Event
client.on("guildMemberAdd", async (member) => {
    if(member.guild.id !== guildId) return;
    await cacheChannel(doorId);
    const channel = client.channels.cache.get(doorId);
    const embed = new MessageEmbed()
        .setColor("GREEN")
        .setTitle("New Bee")
        .setDescription(`Say hello to our new bee, ${member.user.username} who has just entered the hive. :D`)
        .setImage(member.user.avatarURL());
    channel.send({embeds: [embed]});
    member.roles.add("1005166680013557831").catch(e => {console.log(e)});
});

//Member Leave Event
client.on("guildMemberRemove", async (d) => {
    if(d.guild.id !== guildId) return;
    await cacheChannel(doorId);
    const channel = client.channels.cache.get(doorId);
    const embed = new MessageEmbed()
        .setColor("RED")
        .setTitle("Bee Left")
        .setDescription(`${d.user.username} has just left the hive to explore the outside world. o7`)
        .setImage(d.user.avatarURL());
    channel.send({embeds: [embed]});
});

//Log stuff
client.on("guildMemberUpdate", async (oldMember, newMember) => {
    await client.channels.fetch(logsId);
    const channel = client.channels.cache.get(logsId);
    var hasTriggeredAvatarChange = false;
    //Avatar change
    if(oldMember.avatarURL() !== newMember.avatarURL()){
        hasTriggeredAvatarChange = true;
        var embed = new MessageEmbed()
            .setTitle("Avatar Change")
            .setDescription(`${oldMember.user.tag} has changed their avatar from ${oldMember.avatarURL()} to ${newMember.avatarURL()}.`)
            .setImage(newMember.avatarURL())
            .setColor("YELLOW");
        channel.send({embeds: [embed]});
    }
    console.log(hasTriggeredAvatarChange);
    if(hasTriggeredAvatarChange) await sleep(800);
    var hasTriggeredNicknameChange = false;
    if(oldMember.nickname !== newMember.nickname){
        hasTriggeredAvatarChange = true;
        var embed = new MessageEmbed()
        .setTitle("Nickname Change")
        .setDescription(`${oldMember.user.tag} has changed their nickname from ${oldMember.nickname || "**default**"} to ${newMember.nickname || "**default**"}.`)
        .setImage(newMember.avatarURL())
        .setColor("YELLOW");
    channel.send({embeds: [embed]});
    }
});


const messages = [];
client.on("raw", async (d) => {
    if(d.t === "MESSAGE_CREATE"){
        messages.push(d);
        console.log(d);
        return;
    }
    if(d.t === "MESSAGE_DELETE"){
        messages.forEach(async msg => {
            if(d.d.id === msg.d.id){
                var tag = msg.d.author.username + "#" + msg.d.author.discriminator;
                var content = msg.d.content;
                await client.channels.fetch(logsId);
                const channel = client.channels.cache.get(logsId);
                var embed = new MessageEmbed()
                .setTitle("Message Deleted")
                .setDescription(`${tag} has deleted their message in <#${msg.d.channel_id}> containing:\n${content}`)
                .setColor("YELLOW");
                channel.send({embeds: [embed]});
                if(messages.length >= 100) messages.splice(0,messages.length);
            }
        });
        return;
    }
});


/*
client.on("messageDelete", (msg) => {
    console.log("Message deleted");
    const channel = client.channels.cache.get(logsId);
    var embed = new MessageEmbed()
    .setTitle("Message Deleted")
    .setDescription(`${msg.d.author.username}#${msg.d.author.discriminator} has deleted their message containing:\n${msg.d.content}`)
    .setColor("YELLOW");
    channel.send({embeds: [embed]});
});*/

//Login to the API
client.login(fs.readFileSync("token.txt", {encoding: "utf-8"}));