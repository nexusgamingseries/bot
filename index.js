const Discord = require('discord.js');
//hide our secret sauce here.
const token = require('./token-file');
//these are required for web server and exposing URIs
const express = require('express');
const bodyParser = require('body-parser');
//require function for the URI code.
const upsertRole = require('./roleUpsertURI');

//create the client
const client = new Discord.Client();
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

//this sets up a "GET" uri at the provided route and runs the provided function when it's called
app.get('/upsertRole', upsertRole(req, res, client));

//the below is some testing code -- i have found some reference material for moving these actions into their own files so we can avoid index glut,
//TODO, create the index in such a way that the actions go into their own files.
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

//message responds to messages ... needs it's own condition file
client.on('message', msg => {
    if (msg.content === 'ping') {
        msg.reply('Pong!');
    }
});

//hopefully we can use this to track peoples discord handle changing so that we can keep up to date information -- otherwise our automation of role update might fail
client.on('guildMemberUpdate', (oldMember, newMember) => {
    //this even fires when someone updates their nickname.
    console.log('I caught you updating your user! 5 ', oldMember, newMember);
})



client.login(token.lordBotswana);