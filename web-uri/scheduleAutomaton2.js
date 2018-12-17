const util = require('../utils');
const Discord = require('discord.js');
const jimp = require('jimp');
const Enmap = require("enmap");

const fs = require('fs');

const generateEmbed = require('../modules/scheduleGenerateEmbed');


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
        //sort schedules?
        recSchedules = recSchedules.sort(function(a, b) {
            let divisionA = util.returnByPath(a, 'division');
            let divisionB = util.returnByPath(b, 'division');
            if (divisionA > divisionB) {
                return 1;
            } else {
                return -1;
            }
        });

        //return success to caller that the schedules were injested.
        res.status(200).send('The schedules were injested to discord queue!');

        processQueue(recSchedules, client);

    } else {
        res.status(200).send("No schedules received.");
    }
}



module.exports = schedulePoster;

function processQueue(queue, client) {
    let promArr = [];
    queue.forEach(sched => {
        let embed = generateEmbed(sched);
        let f = async(sched, embed) => {
            let imgFile = await generateImages(sched);
            console.log(imgFile);
            console.log(embed.image.url);
            newEmbed = new Discord.RichEmbed(embed);
            // dispatch the embed out to the discord server
            // console.log(newEmbed);
            let msg = await client.channels.get('518953832890368004').send({
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
                        attachment: 'img/' + imgFile,
                        name: imgFile
                    }
                ]
            }).then(suc => {
                return imgFile;
            }, fail => {
                return imgFile;
            });
            return msg;
        }
        promArr.push(f(sched, embed));
    });

    console.log(promArr);

    Promise.all(promArr).then(suc => {
        console.log(suc);
        deleteFiles(suc);
    }, fail => {
        console.log(fail);
        deleteFiles(fail);
    })

}

function deleteFiles(fileArray) {
    fileArray.forEach(file => {
        fs.unlink('img/' + file, (err) => {
            console.log(err);
        });
    });

}

async function generateImages(sched) {
    // IMAGE PROCESSING 
    // will need the image URL of each team's logo
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

    const newImage = await new jimp(600, 150);
    imageMesh[0].resize(200, 150);
    imageMesh[1].resize(200, 150);
    imageMesh[2].resize(200, 150);
    //composite the new image from the provided images.
    newImage.composite(imageMesh[0], 0, 0);
    newImage.composite(imageMesh[2], 388, 0);
    newImage.composite(imageMesh[1], 195, 0);

    let outFile = sched.homeTeam.name + sched.awayTeam.name + sched.matchDetails.date + '.png';
    let reg = new RegExp(/\s/, 'g');
    outFile = outFile.replace(reg, '');
    const written = await newImage.writeAsync('img/' + outFile).then(suc => { return true; }, fail => { return false; });

    console.log(written);
    return outFile;
}