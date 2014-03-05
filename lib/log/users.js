var Table = require('./table');

exports.users = function (error, users) {
    if (error) {
        return console.log(error);
    }

    if (users.length === 0) {
        return console.log('No users');
    }

    var table = new Table({
        head: ['Id', 'Name', 'E-mail']
    });

    for (var key in users) {
        var user = users[key];

        table.push([
            user.key,
            user.displayName,
            user.emailAddress
        ]);
    }

    console.log(table.toString());
};