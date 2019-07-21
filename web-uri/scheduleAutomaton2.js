const util = require('../utils');
const Discord = require('discord.js');
const jimp = require('jimp');
const Enmap = require("enmap");

const fs = require('fs');

const generateEmbed = require('../modules/scheduleGenerateEmbed');


const defaultTeamA = process.env.heroProfileImage + 'defaultTeamLogo.png';
const defaultTeamB = process.env.heroProfileImage + 'defaultTeamLogo.png';
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
            let divisionA = parseInt(util.returnByPath(a, 'divSort'));
            let divisionB = parseInt(util.returnByPath(b, 'divSort'));
            console.log(divisionA, divisionB)
            if (divisionA > divisionB) {
                return -1;
            } else {
                return 1;
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
        let f = async(sched) => {
            let imgFile = await generateImages(sched);
            let embed = generateEmbed(sched, imgFile);

            newEmbed = new Discord.RichEmbed(embed);
            // dispatch the embed out to the discord server
            console.log(newEmbed);
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
        promArr.push(f(sched));
    });

    Promise.all(promArr).then(suc => {
        console.log('suc ', suc);
        deleteFiles(suc);
    }, fail => {
        console.log('fail ', fail);
        deleteFiles(fail);
    })

}

function deleteFiles(fileArray) {
    fileArray.forEach(file => {
        fs.unlink('img/' + file, (err) => {
            if (err) {
                console.log(err);
            }
        });
    });

}

function returnLogoUrl(logo) {
    return process.env.heroProfileImage + encodeURIComponent(logo);
}

async function generateImages(sched) {
    // IMAGE PROCESSING 
    // will need the image URL of each team's logo
    let homeLogo = util.returnBoolByPath(sched, 'home.logo') ? returnLogoUrl(sched.home.logo) : defaultTeamA;
    let awayLogo = util.returnBoolByPath(sched, 'away.logo') ? returnLogoUrl(sched.away.logo) : defaultTeamB;
    var images = [homeLogo, 'img/vs-meger.png', awayLogo];
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

    let outFile = sched.home.teamName + sched.away.teamName + sched.scheduledTime.startTime.toString();
    let reg = new RegExp(/[^0-9a-zA-Z]+/, 'g');
    outFile = outFile.replace(reg, '');
    outFile += '.png';
    const written = await newImage.writeAsync('img/' + outFile).then(suc => { return true; }, fail => { return false; });

    return outFile;
}