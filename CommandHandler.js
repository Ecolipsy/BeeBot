const fs = require("fs");
const serverId = "1005166532168515594";
var client = null;

const commands = [];

function getCommand(name){
    var cmd = null;
    commands.forEach(cmd2 => {
        if(name === cmd2.name) cmd = cmd2; 
    });
    return cmd;
}

module.exports = {
    setClient: (cli) => {
        client = cli;
    },
    load: () => {
        if(!client) throw new Error("Client hasn't been set");
        const commandFiles = fs.readdirSync("commands");
        commandFiles.forEach(cmdFile => {
            const cmd = require(`./commands/${cmdFile}`);
            cmd.name = cmdFile.split(".")[0];
            cmd.fileName = cmdFile;
            commands.push(cmd);
        });
        const apiCommands = [];
        commands.forEach(cmd => {
            var apiCmd = {name: cmd.name, description: cmd.description, arguments: cmd.args || null}
            apiCommands.push(apiCmd);
        });
        client.guilds.cache.get(serverId).commands.set(apiCommands);
    },
    reload: () => {
        commands.forEach(cmd => {
            delete require.cache[require.resolve("./commands/" + cmd.fileName)];
            commands.splice(commands.indexOf(cmd),1);
        });
        this.load();
    },
    handleInteraction: (int) => {
        if(!getCommand(int.commandName)){
            int.reply("Command not found wtf?!");
        }
        getCommand(int.commandName).run(int, client);
    }
}