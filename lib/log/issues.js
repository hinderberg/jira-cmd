var Table = require('./table');

exports.issues = function (error, issues) {
    if (error) {
        return console.log(error);
    }

    if (issues.length === 0) {
        return console.log('No issues');
    }

    var table = new Table({
        head: ['Key', 'Priority', 'Summary']
    });

    for (var i = 0; i < issues.length; i += 1) {
        var priority = issues[i].fields.priority,
            summary = issues[i].fields.summary;

        if (!priority) {
            priority = {
                name: ''
            };
        }
        if (summary.length > 50) {
            summary = summary.substr(0, 47) + '...';
        }
        table.push([
            issues[i].key,
            priority.name,
            summary
        ]);
    }

    console.log(table.toString());
};

exports.issue = function (err, issue) {

    if (err) {
        return console.log(err);
    }

    var table = new Table();

    table.push(
        {'Issue': issue.key || ''},
        {'Summary': issue.summary || ''},
        {'Type': issue.issuetype.name || ''},
        {'Priority': issue.priority.name || ''},
        {'Status': issue.status.name || ''},
        {'Reporter': (issue.reporter.displayName || '')
            + ' <' + (issue.reporter.emailAddress || '') + '> '},
        {'Assignee': (issue.assignee.displayName || '')
            + ' <' + (issue.assignee.emailAddress || '') + '> '},
        {'Labels': issue.labels.join(', ')},
        {'Subtasks': issue.subtasks.length},
        {'Comments': issue.comment.total}
    );

    console.log(table.toString());
    console.log('\r\nDescription: ' + issue.description + '\r\n');
};

exports.field = function (err, field) {
    if (err) {
        return console.log(err);
    }

    console.log(field);
};

exports.comment = function (err, object) {
    if (err) {
        return console.log(err);
    }

    console.log('Comment to issue [' + object.issueId + '] was posted!.');
};

exports.showComments = function (err, comments) {
    if (err) {
        return console.log(err);
    }

    if (comments.total === 0) {
        return console.log('There are no comments on this issue.');
    }

    for (var i = 0; i < comments.total; i += 1) {
        var comment = comments.comments[i];
        var updated = new Date(comment.updated);
        updated = ' (' + updated + ')';

        console.log('\n' + comment.author.displayName.cyan + updated.grey);
        console.log(comment.body);
    }
};

exports.assign = function (err, object) {
    if (err) {
        return console.log(err);
    }

    console.log('Issue [' + object.issueId + '] assigned to ' + object.username);
};