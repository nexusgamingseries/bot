//hopefully we can use this to track peoples discord handle changing so that we can keep up to date information -- otherwise our automation of role update might fail
//TODO flesh this out and add a call back / update to the main data source


module.exports = async(client) => {
    client.on('guildMemberUpdate', (oldMember, newMember) => {
        //this even fires when someone updates their nickname.
        console.log('I caught you updating your user! 5 ', oldMember, newMember);
    });
};