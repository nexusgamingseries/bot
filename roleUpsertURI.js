// req - HTTP request, res - http response, client -- the discord client , not a part of the HTTP contract but needed here
function roleUpsert(req, res, client) {
    //parse some variables from the request
    let role = req.query.role;
    let user = req.query.user;

    console.log('role ', role, 'user ', user);
    //this is role object, per discord documentation you need this blueprint to create a role
    let roleObject = {
            name: role,
            color: '908AAA', //TODO: need a random color generator
            hoist: true,
            mentionable: true
        }
        //We need to extract some information from our discord server so that we don't over write or step on other:
        // "guild" == server ... just using the test discord id
    let guild = client.guilds.get('518953832458485781');
    // "existingRole" - check in the roles and see if this role provided exists ... this will be a team name in this instance 
    let exRole = guild.roles.find(roleIt => roleIt.name == role);

    console.log('existing role ', exRole);

    //check the client and see if the user exists in the client, we can get their ID which makes finding them in the guild easier.
    let usr = client.users.find(usrIt => {
        return usrIt.username == user;
    });

    console.log('FOUND USER ', usr);

    //once we have the user id get the guild member (this is actually what we use to update the role, roles are GUILD specific)
    let guildMember = guild.members.get(usr.id);

    console.log('guild member ', guildMember);

    //was the role in the guild?
    if (exRole == undefined || exRole == null) {
        //create the role creating the role for good measure here even though its possible the user wasnt found ....
        guild.createRole(roleObject, 'API role creation.').then(role => {
            if (usr != undefined && usr != null) {
                //add role to user
                guildMember.addRole(role.id, 'API role add');
            } else {
                console.log('user not found');
            }
            //http success response
            res.status(200).send('role created');
        }, err => {
            //http error response
            res.status(400).send('something went wrong ', err);
        });
    } else {
        //the role was existing so we shall not recreate it
        if (usr != undefined && usr != null) {
            //add the role to the user
            guildMember.addRole(exRole.id, 'API role add');
            //this else branch needs its own http replies
            res.status(200).send('role added');
        } else {
            //this else branch needs its own http replies
            res.status(400).send('something went wrong ');
        }
    }
}
module.exports = roleUpsert;