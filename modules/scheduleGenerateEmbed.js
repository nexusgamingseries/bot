const util = require('../utils');

function generateEmbed(sched) {
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
    modifiedTime[0] = modifiedTime[0] - 3;
    modifiedTime = modifiedTime.join(':');
    let startingTime = "Starting Time: " + sched.matchDetails.startingTimeEST + " EST; " + modifiedTime + " PST"; //data from post

    let caster = {};
    if (util.returnBoolByPath(sched, 'casterDetails')) {
        caster.name = "Caster: " + sched.casterDetails.name; //data from post -- NOT INCLUDED IF NOT PRESENT
        caster.link = "[Link](" + sched.casterDetails.link + ")"; //data from post -- NOT INCLUDED IF NOT PRESENT
    }
    let imgString = sched.homeTeam.name + sched.awayTeam.name + sched.matchDetails.date + '.png';
    let reg = new RegExp(/\s/, 'g');
    imgString = imgString.replace(reg, '');

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
            "url": "attachment://" + imgString
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

    return embed;

}
module.exports = generateEmbed;