const util = require('../utils');
const Discord = require('discord.js');
const jimp = require('jimp');


const defaultUrl = 'http://ngs.com';
const defaultTeamA = 'img/teamAdefault.png';
const defaultTeamB = 'img/teamBdefault.png';
const thumbnail = 'img/NGS-thumbnail.png';
const footer = 'img/ngsFooter.png';

//this bad boy is going to respond to post requests and post them to the discor server
function schedulePoster(req, res, client) {
    let recSchedules = req.body.schedules;
    // console.log(recSchedules, typeof recSchedules)
    // console.log(client.channels);
    if (recSchedules != undefined && recSchedules != null && recSchedules.length > 0) {

        recSchedules = recSchedules.sort(function(a, b) {
            let divisionA = util.returnByPath(a, 'division');
            let divisionB = util.returnByPath(b, 'division');
            if (divisionA > divisionB) {
                return 1;
            } else {
                return -1;
            }
        });

        recSchedules.forEach(element => {

            //create rich embed from the provided object
            handleSchedule(element).then(embed => {
                // console.log(embed);

                newEmbed = new Discord.RichEmbed(embed);
                // dispatch the embed out to the discord server
                client.channels.get('518953832890368004').send({
                    embed: newEmbed,
                    files: [{
                            attachment: 'img/NGS-thumbnail.png',
                            name: 'thumbnail.png'
                        },
                        {
                            attachment: 'img/ngsFooter.png',
                            name: 'footer.png'
                        },
                        {
                            attachment: 'img/vs-lineup.png',
                            name: 'vs-lineup.png'
                        }
                    ]
                });

            });

        });
        res.status(200).send('The schedules were wrote to discord!');

    } else {
        res.status(200).send("No schedules received.");
    }
}



module.exports = schedulePoster;

async function handleSchedule(sched) {
    let coast = sched.coast ? sched.coast : '';
    let title = 'Division ' + sched.division + ' ' + coast + ' : Match Announcement!'; // Data From Post
    let description = "Season " + sched.season + " Week " + sched.week + " : Match Up!"; //Data from post
    let matchURL = sched.matchUrl; //link to match from post
    let teamA = {};
    teamA.name = sched.homeTeam.name; //data from post
    teamA.details = "[ # " + sched.homeTeam.standing + " : ( " + sched.homeTeam.win + " - " + sched.homeTeam.loss + ")](" + sched.homeTeam.url + ")";

    let teamB = {};
    teamB.name = sched.awayTeam.name; //data from post
    teamB.details = "[ # " + sched.awayTeam.standing + " : ( " + sched.awayTeam.win + " - " + sched.awayTeam.loss + ")](" + sched.awayTeam.url + ")";

    let modifiedTime = sched.matchDetails.startingTimeEST;
    modifiedTime = modifiedTime.split(':');
    modifiedTime[0] = modifiedTime[0] - 2;
    modifiedTime = modifiedTime.join(':');
    let startingTime = "Starting Time: " + sched.matchDetails.startingTimeEST + " EST; " + modifiedTime + " PST"; //data from post

    let caster = {};
    if (util.returnBoolByPath(sched, 'casterDetails')) {
        caster.name = "Caster: " + sched.casterDetails.name; //data from post -- NOT INCLUDED IF NOT PRESENT
        caster.link = "[Link](" + sched.casterDetails.link + ")"; //data from post -- NOT INCLUDED IF NOT PRESENT
    }
    //stubbing out an embed
    const embed = {
        "title": title,
        "description": description,
        "url": matchURL,
        "color": 1623685, //change to NGS color
        "footer": {
            "icon_url": "attachment://footer.png", //NGS logo
            "text": "Nexus Gaming Series Hype!"
        },
        "thumbnail": {
            "url": "attachment://thumbnail.png" //NGS logo
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

    if (util.returnBoolByPath(sched, 'casterDetails')) {
        embed.fields.push({
            "name": caster.name,
            "value": caster.link
        });
    }

    // console.log(embed);

    //will need the image URL of each team's logo
    let homeLogo = util.returnBoolByPath(sched, 'homeTeam.logoUrl') ? sched.homeTeam.logoUrl : defaultTeamA;
    let awayLogo = util.returnBoolByPath(sched, 'awayTeam.logoUrl') ? sched.awayTeam.logoUrl : defaultTeamB;
    var images = [homeLogo, 'img/vs-meger.png', awayLogo];
    // console.log(images);
    // console.log(homeLogo, awayLogo);
    let jimps = [];

    //create promise array of images.
    for (var i = 0; i < images.length; i++) {
        jimps.push(
            jimp.read(images[i]).then(img => {
                return img;
            }, err => {
                return null;
            })
        );
    }
    //resolve the images and lets do the required work.
    const imageMesh = await Promise.all(jimps).then(function(data) {
        return Promise.all(jimps);
    }).then(function(data) {
        return data;
    });
    // console.log(imageMesh);
    // let resolvedOK = true;
    // let errorIndex = [];
    // console.log(imageMesh);
    for (let i = 0; i < imageMesh.length; i++) {
        if (imageMesh[i] == null) {
            if (i == 0) {
                imageMesh[0] = await jimp.read(defaultTeamA);
            } else {
                imageMesh[2] = await jimp.read(defaultTeamB);
            }
        }
    }

    //create a new image of 600px x 150px tall
    const newImage = await new jimp(600, 150, (err, image) => {
        //resize all the images
        // imageMesh[0].resize(200, 150);
        // imageMesh[1].resize(200, 150);
        // imageMesh[2].resize(200, 150);
        // //composite the new image from the provided images.
        // image.composite(imageMesh[0], 0, 0);
        // image.composite(imageMesh[2], 388, 0);
        // image.composite(imageMesh[1], 195, 0);
        //write out the image
        // image.write('img/vs-lineup.png', function() {
        //     console.log("wrote the image");
        // });
    });

    //resize all the images
    imageMesh[0].resize(200, 150);
    imageMesh[1].resize(200, 150);
    imageMesh[2].resize(200, 150);
    //composite the new image from the provided images.
    newImage.composite(imageMesh[0], 0, 0);
    newImage.composite(imageMesh[2], 388, 0);
    newImage.composite(imageMesh[1], 195, 0);

    const write = await newImage.write('img/vs-lineup.png');

    return embed;

}