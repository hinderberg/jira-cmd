var request = require('superagent');
var config = require( './config');

function makeUri(path) {
    var url = config.auth.url + 'rest/api/latest/' + path;
    console.log('Fetching from: ' + url);
    return decodeURIComponent(url);
}

function setupPutRequest(url) {
    return request
        .put(makeUri(url))
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Basic ' + config.auth.token);
}

function setupGetRequest(url) {
    return request
        .get(makeUri(url))
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Basic ' + config.auth.token);
}

function setupPostRequest(url) {
    return request
        .post(url)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Basic ' + config.auth.token)
}

function parseError(res) {
    if (res.statusCode === 404) {
        return new Error('Could not find url: ' + res.error.path);
    } else if (res.statusCode === 401) {
        return new Error('You are unauthorized');
    }

    if (res.body.errorMessages) {
        return new Error(res.body.errorMessages.join('\n'))
    }

    return new Error('An error occurred');
}

function getIssues(query, callback) {
    setupGetRequest(query)
        .end(function (res) {
            if (!res.ok) {
                return callback(parseError(res));
            }

            callback(null, res.body.issues)

        });
}

exports.getFieldValueOnIssue = function(issueId, fieldName, callback) {
    var query = 'issue/' + issueId + '?fields=' + fieldName;

    setupGetRequest(query).end(function (res) {
        if (!res.ok) {
            return callback(parseError(res));
        }

        if (!res.body.fields) {
            callback(new Error("Did not find a field matching: " + fieldName));
        }

        var field;
        if (typeof (res.body.fields[fieldName]) === 'string') {
            field = res.body.fields[fieldName];
        } else {
            field = res.body.fields[fieldName].name;
        }

        callback(null, field);
    });
};


exports.issue = function(issueId, callback) {
    var query = 'issue/' + issueId;

    setupGetRequest(query).end(function (res) {
        if (!res.ok) {
            return callback(parseError(res));
        }

        var issue = res.body.fields;

        issue.priority = issue.priority || {name: ''};
        issue.description = issue.description || 'No description';
        issue.key = issueId;

        callback(null, issue);
    });
};

exports.filterBy = function (filterParams, callback) {
    var filterParams = filterParams || {};
    var queries = {
        assignee: 'assignee=' + filterParams.assignee,
        type: 'type=' + filterParams.type,
        project: 'project=' + filterParams.project,
        status: 'status=' + filterParams.status,
        fixVersion: 'fixVersion=' + filterParams.fixVersion
    };

    var query = 'search?jql=';
    query += Object.keys(queries).
    filter(function (key) {
        return filterParams[key];
    }).map(function (key) {
        return queries[key];
    }).join('+AND+');
    query += '+order+by+priority+DESC,+key+ASC';

    return getIssues(query, callback);
};

exports.search = function(query, callback) {
    var query = 'search?jql='
        + 'summary+~+"' + query + '"'
        + '+OR+description+~+"' + query + '"'
        + '+OR+comment+~+"' + query + '"'
        + '+order+by+priority+DESC,+key+ASC';

    return getIssues(query, callback);
};

exports.assign = function(username, issueId, callback) {
    var query = 'issue/' + issueId + '/assignee';

    setupPutRequest(query)
        .send({ 'name': username })
        .end(function (res) {
            if (!res.ok) {
                return callback(parseError(res));
            }

            return {
                username: username,
                issueId: issueId
            };

        });
};

exports.versions = function(projectId, callback) {
    var query = 'project/' + projectId + '/versions';

    setupGetRequest(query).end(function (res) {
        if (!res.ok) {
            return callback(parseError(res));
        }

        callback(null, res.body);
    });
};

exports.comment = function(issueId, comment) {

    var query = 'issue/' + issueId + '/comment';

    setupPostRequest(query)
        .send({ body: comment })
        .end(function (res) {
            if (!res.ok) {
                return callback(parseError(res));
            }

            callback(null, {
                issueId: issueId,
                comment: comment
            });
        });
};

exports.showComments = function(issueId) {

    var query = 'issue/' + issueId + '/comment';

    setupGetRequest(query)
        .end(function (res) {
            if (!res.ok) {
                return callback(parseError(res));
            }

            callback(null, res.body);

        });
};