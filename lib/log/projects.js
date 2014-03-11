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

exports.projects = function(err, projects) {

    if (err) {
        return console.log(err);
    }

    if (projects.length === 0) {
        return console.log('No projects');
    }

    var table = new Table({
        head: ['Id', 'Name', 'IssueTypes']
    });

    for (var i = 0; i < projects.length; i += 1) {
        var project = projects[i];
        table.push([
            project.id,
            project.name || '',
            issueTypes(project.issuetypes).join()
        ]);
    }

    console.log(table.toString());

};

function issueTypes(issueTypes) {

    if (issueTypes.length === 0) {
        return 'No issue types';
    }

    return issueTypes.map(function(issueType) {
        return issueType.name + '(' + issueType.id + ')';
    });

}