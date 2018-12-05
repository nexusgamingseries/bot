const Discord = require('discord.js');
const config = require('./config');

//these are required for web server and exposing URIs
const express = require('express');
const bodyParser = require('body-parser');
//require function for the URI code.
const upsertRole = require('./roleUpsertURI');
//these are required for loading in the commands and events from file
const {
    promisify
} = require("util");
const readdir = promisify(require("fs").readdir);
const Enmap = require("enmap");

//this creates an express variable for running our webserver
const app = express();
//the following are parsers for the different type of requests we might take get/post and the data that comes with em
app.use(bodyParser.json({
    limit: '2.5mb',
    extended: true
}));

app.use(bodyParser.urlencoded({
    extended: false
}));

//set the port / host name
let port = 3030;
let hostname = '127.0.0.1';

//tell express to listen
app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

//create the discord client
const client = new Discord.Client();

client.config = config;
//'./logs.txt'
client.logger = require('./modules/Logger');

//bootstrapping the functions module
require("./modules/functions.js")(client);

// Aliases and commands are put in collections where they can be read from,
// catalogued, listed, etc.
client.commands = new Enmap();
client.aliases = new Enmap();

// Now we integrate the use of Evie's awesome Enhanced Map module, which
// essentially saves a collection to disk. This is great for per-server configs,
// and makes things extremely easy for this purpose.
client.settings = new Enmap({
    name: "settings"
});

const init = async() => {

    // Here we load **commands** into memory, as a collection, so they're accessible
    // here and everywhere else.
    const cmdFiles = await readdir("./commands/");
    client.logger.log(`Loading a total of ${cmdFiles.length} commands.`);
    cmdFiles.forEach(f => {
        if (!f.endsWith(".js")) return;
        const response = client.loadCommand(f);
        if (response) console.log(response);
    });

    // Then we load events, which will include our message and ready event.
    const evtFiles = await readdir("./events/");
    client.logger.log(`Loading a total of ${evtFiles.length} events.`);
    evtFiles.forEach(file => {
        const eventName = file.split(".")[0];
        client.logger.log(`Loading Event: ${eventName}`);
        const event = require(`./events/${file}`);
        // Bind the client to any event, before the existing arguments
        // provided by the discord.js event. 
        // This line is awesome by the way. Just sayin'.
        client.on(eventName, event.bind(null, client));
    });

    // Generate a cache of client permissions for pretty perm names in commands.
    client.levelCache = {};
    for (let i = 0; i < client.config.permLevels.length; i++) {
        const thisLevel = client.config.permLevels[i];
        client.levelCache[thisLevel.name] = thisLevel.level;
    }

    // Here we login the client.
    client.login(client.config.token);

    // End top-level async/await function.
};

init();


//this sets up a "GET" uri at the provided route and runs the provided function when it's called
app.get('/upsertRole', (req, res) => { upsertRole(req, res, client) });