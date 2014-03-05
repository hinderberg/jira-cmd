var Table = require('./table');

exports.versions = function (error, versions) {
    if (error) {
        return console.log(error);
    }

    if (versions.length === 0) {
        return console.log('No versions');
    }

    var table = new Table({
        head: ['Id', 'Name', 'Description']
    });

    for (var i = 0; i < versions.length; i += 1) {
        var version = versions[i];
        table.push([
            version.id,
            version.name || '',
            version.description || ''
        ]);
    }

    console.log(table.toString());
};