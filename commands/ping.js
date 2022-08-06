const { CommandInteraction, Client } = require("discord.js");

/**
 * 
 * @param {CommandInteraction} int 
 * @param {Client} client 
 */
function run(int, client){
    int.reply(`:ping_pong: My latency to the WS gateway is: ${client.ws.ping} ms. :ping_pong:`)
}

module.exports = {description: "Sends the latency of the bot.", roleRequired: null, run}