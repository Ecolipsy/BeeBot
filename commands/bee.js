const { CommandInteraction, Client } = require("discord.js");

/**
 * 
 * @param {CommandInteraction} int 
 * @param {Client} client 
 */
function run(int, client){
    const beeFiles = require("fs").readdirSync("bees");
    int.reply({files: ["./bees/" + beeFiles[Math.floor(Math.random()*beeFiles.length)]]});
}

module.exports = {description: "Sends a random image of a bee :)", roleRequired: null, run}