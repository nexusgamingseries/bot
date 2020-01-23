const util = require('../utils');

function generateEmbed(sched, imgString) {
    let coast = sched.coast ? sched.coast : '';
    // let title = 'Division ' + sched.divisionConcat + ' ' + coast + ' : Match Announcement!'; // Data From Post
    let title = 'Division ' + sched.divisionDisplayName + ' : Match Announcement!';
    let description = "Season " + sched.season + " Week " + sched.round + " : Match Up!"; //Data from post
    // TODO - match URL
    let matchURL = process.env.ngsTLD + process.env.ngsMatchPage + sched.matchId; //link to match from post
    let teamA = {};
    teamA.name = sched.home.teamName; //data from post
    teamA.details = "[ # " + sched.home.standing + " : ( " + sched.home.win + " - " + sched.home.loss + ")](" + process.env.ngsTLD + process.env.ngsTeamPage + routeFriendlyTeamName(sched.home.teamName) + ")";

    let teamB = {};
    teamB.name = sched.away.teamName; //data from post
    teamB.details = "[ # " + sched.away.standing + " : ( " + sched.away.win + " - " + sched.away.loss + ")](" + process.env.ngsTLD + process.env.ngsTeamPage + routeFriendlyTeamName(sched.away.teamName) + ")";

    let startingTime = "Starting Time: " + util.prettyTime(sched.scheduledTime.startTime, null, 'hh:mm') + " EST; " + util.prettyTime(sched.scheduledTime.startTime, 'America/Los_Angeles', 'hh:mm') + " PST"; //data from post

    let caster = {};
    if (util.returnBoolByPath(sched, 'casterDetails')) {
        caster.name = "Caster: " + sched.casterDetails.name; //data from post -- NOT INCLUDED IF NOT PRESENT
        caster.link = "[Link](" + sched.casterDetails.link + ")"; //data from post -- NOT INCLUDED IF NOT PRESENT
    }
    // let imgString = sched.home.teamName + sched.away.teamName + sched.scheduledTime.startTime + '.png';
    // let reg = new RegExp(/\s/, 'g');
    // imgString = imgString.replace(reg, '');

    // console.log('imgString in genEmbed ', imgString);

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

    if (util.returnBoolByPath(sched, 'casterName')) {
        embed.fields.push({
            "name": 'Casted By: ' + sched.casterName,
            "value": 'https://' + sched.casterUrl
        });
    }

    return embed;

}
module.exports = generateEmbed;

function routeFriendlyTeamName(teamname) {
    if (teamname != null && teamname != undefined) {
        let strArr = [];
        for (let i = 0; i < teamname.length; i++) {
            strArr.push(teamname.charAt(i));
        }
        strArr.forEach((char, index) => {
            strArr[index] = replace(char);
        });
        return strArr.join('');
    } else {
        return '';
    }
}

function replace(char) {
    let ind = mapIndexOf(char);
    if (ind > -1) {
        return reserveCharacterMap[ind].replace;
    } else {
        return char;
    }
}

function mapIndexOf(char) {
    let ind = -1;
    reserveCharacterMap.forEach((map, index) => {
        if (map.char === char) {
            ind = index;
        }
    })
    return ind;
}

const reserveCharacterMap = [

    {
        "char": "(",
        "replace": "-open-parentheses-"
    },
    {
        "char": ")",
        "replace": "-close-parentheses-"
    },
    {
        "char": "{",
        "replace": "-open-curl-bracket-"
    },
    {
        "char": "}",
        "replace": "-close-curl-bracket-"
    },
    {
        "char": ";",
        "replace": "-semicolon-"
    },
    {
        "char": "=",
        "replace": "-equals-"
    },
    {
        "char": "+",
        "replace": "-plus-"
    },
    {
        "char": "/",
        "replace": "-forwardslash-"
    },
    {
        "char": "?",
        "replace": "-question-"
    },
    {
        "char": "#",
        "replace": "-number-"
    },
    {
        "char": "[",
        "replace": "-open-bracket-"
    },
    {
        "char": "]",
        "replace": "-close-bracket-"
    },
    {
        "char": "%",
        "replace": "-percent-"
    },
    {
        "char": "^",
        "replace": "-caret-"
    },
    {
        "char": "`",
        "replace": "-backtick-"
    },
    {
        "char": "\\",
        "replace": "-backslash-"
    },
    {
        "char": " ",
        "replace": "_"
    },
    {
        "char": "|",
        "replace": "-pipe-"
    },

];