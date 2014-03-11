var Table = require('./table');

exports.priorities = function (error, priorities) {
    if (error) {
        return console.log(error);
    }

    if (priorities.length === 0) {
        return console.log('No priorities');
    }

    var table = new Table({
        head: ['Id', 'Name', 'Description']
    });

    for (var key in priorities) {
        var priority = priorities[key];

        table.push([
            priority.id,
            priority.name,
            priority.description
        ]);
    }

    console.log(table.toString());
};