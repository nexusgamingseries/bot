const Discord = require('discord.js');
const jimp = require('jimp');




exports.run = async(client, message, args, level) => { // eslint-disable-line no-unused-vars
 
    let title = "Division D East : Match Announcement!"; // Data From Post
    let description = "Season X Week Y : Match Up!"; //Data from post
    let matchURL = "https://ngs.com/season/division/matchup/12345"; //link to match from post
    let teamA = {};
    teamA.name = "Team A" //data from post
    teamA.details = "[#Standing : ( W - L )](http://www.ngs.com/teamA)"; //data from post

    let teamB = {};
    teamB.name = "Team B"; //data from post
    teamB.details = "[#Standing : ( W - L )](https://www.ngs.com/teamB)"; //data from post

    let startingTime = "Starting Time: XX EST; XX PST"; //data from post

    let caster = {};
    caster.name = "Caster: BozoMcCastsAlot"; //data from post -- NOT INCLUDED IF NOT PRESENT
    caster.link = "[Link](https://twitch.tv/cast-a-lot)"; //data from post -- NOT INCLUDED IF NOT PRESENT

    //stubbing out an embed
    const embed = {
        "title": title,
        "description": description,
        "url": matchURL,
        "color": 1623685, //change to NGS color
        "footer": {
            "icon_url": "http://placekitten.com/200/300", //NGS logo
            "text": "Nexus Gaming Series Hype!"
        },
        "thumbnail": {
            "url": "http://placekitten.com/500/500" //NGS logo
        },
        "image": {
            "url": "attachment://vs-lineup.png"
        },
        "fields": [{
                "name": teamA.name,
                "value": teamA.details,
                "inline": true
            },
            {
                "name": teamB.name,
                "value": teamB.details,
                "inline": true
            },
            {
                "name": startingTime,
                "value": "-"
            }
        ]
    };

    if (caster != null && caster != undefined) {
        embed.fields.push({
            "name": caster.name,
            "value": caster.link
        });
    }

    //will need the image URL of each team's logo
    var images = ['http://placekitten.com/200/150', 'img/vs-meger.png', 'http://placekitten.com/250/200'];

    //hold our promises
    var jimps = [];
    //create promise array of images.
    for (var i = 0; i < images.length; i++) {
        jimps.push(jimp.read(images[i]));
    }
    //resolve the images and lets do the required work.
    const imageMesh = await Promise.all(jimps).then(function(data) {
        return Promise.all(jimps);
    }).then(function(data) {
        return data;
    });

    //create a new image of 600px x 150px tall
    const newImage = await new jimp(600, 150, (err, image) => {
        //resize all the images
        imageMesh[0].resize(200, 150);
        imageMesh[1].resize(200, 150);
        imageMesh[2].resize(200, 150);
        //composite the new image from the provided images.
        image.composite(imageMesh[0], 0, 0);
        image.composite(imageMesh[2], 388, 0);
        image.composite(imageMesh[1], 195, 0);
        //write out the image
        image.write('img/vs-lineup.png', function() {
            console.log("wrote the image");
        });

    });

    //create rich embed from the provided object
    let newEmbed = new Discord.RichEmbed(embed);
    //dispatch the embed out to the discord server
    const msg = await message.channel.send({ embed: newEmbed, files: [{ attachment: 'img/vs-lineup.png', name: 'vs-lineup.png' }] });

};

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: [],
    permLevel: "User"
};

exports.help = {
    name: "schedule",
    category: "Miscelaneous",
    description: "Displays schedule.",
    usage: "schedule"
};