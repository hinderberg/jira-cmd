var request = require('superagent');
var config = require('./config');
var _ = require('underscore');

function makeUri(path) {
    var url = config.fileConfig.url + 'rest/api/2/' + path;
    console.log('Doing stuff on: ' + url);
    return decodeURIComponent(url);
}

function setupPutRequest(url) {
    return request
        .put(makeUri(url))
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Basic ' + config.fileConfig.token);
}

function setupGetRequest(url) {
    return request
        .get(makeUri(url))
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Basic ' + config.fileConfig.token);
}

function setupPostRequest(url) {
    return request
        .post(makeUri(url))
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Basic ' + config.fileConfig.token)
}

function parseError(res) {
    if (res.body.errorMessages && res.body.errorMessages.length > 0) {
        return new Error(res.body.errorMessages.join('\n'));
    } else if(res.body.errors) {

        var s = '';
        for (var key in res.body.errors) {
            s += key + ': ' + res.body.errors[key] + '\n';
        }

        return new Error(s);
    }
    else if (res.statusCode === 404) {
        return new Error('Could not find url: ' + res.error.path);
    } else if (res.statusCode === 401) {
        return new Error('You are unauthorized');
    }

    return new Error('An error occurred');
}

function buildQuery(possibleFilters, filterParams, querySeparator) {
    filterParams = filterParams || {};

    var query = _.pick(filterParams, possibleFilters);

    return Object.keys(query).
        filter(function (key) {
            return filterParams[key];
        }).map(function (key) {
            return key + '=' + filterParams[key];
        }).join(querySeparator);
}


/* Issues */

function getIssues(query, callback) {
    setupGetRequest(query)
        .end(function (res) {
            if (!res.ok) {
                return callback(parseError(res));
            }

            callback(null, res.body.issues)

        });
}

exports.getFieldValueOnIssue = function (issueId, fieldName, callback) {
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


exports.issue = function (issueId, callback) {
    var query = 'issue/' + issueId;

    setupGetRequest(query).end(function (res) {
        if (!res.ok) {
            return callback(parseError(res));
        }

        var issue = res.body.fields;

        issue.assignee = issue.assignee || {};
        issue.priority = issue.priority || {name: ''};
        issue.description = issue.description || 'No description';
        issue.reporter = issue.reporter || {};
        issue.key = issueId;

        callback(null, issue);
    });
};

exports.filterBy = function (filterParams, callback) {
    var possibleFilters = {
        assignee: undefined,
        type: undefined,
        project: undefined,
        status: undefined,
        fixVersion: undefined
    };

    var query = 'search?jql=';
    query += buildQuery(Object.keys(possibleFilters), filterParams, '+AND+');
    query += '+order+by+priority+DESC,+key+ASC';

    return getIssues(query, callback);
};

exports.search = function (filter, callback) {
    var query = 'search?jql='
        + 'summary+~+"' + filter + '"'
        + '+OR+description+~+"' + filter + '"'
        + '+OR+comment+~+"' + filter + '"'
        + '+order+by+priority+DESC,+key+ASC';

    return getIssues(query, callback);
};

exports.assign = function (issueId, username, callback) {
    var query = 'issue/' + issueId + '/assignee';

    setupPutRequest(query)
        .send({ 'name': username })
        .end(function (res) {
            if (!res.ok) {
                return callback(parseError(res));
            }

            callback(null, {
                username: username,
                issueId: issueId
            });

        });
};

exports.comment = function (issueId, comment, callback) {

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

exports.showComments = function (issueId, callback) {

    var query = 'issue/' + issueId + '/comment';

    setupGetRequest(query)
        .end(function (res) {
            if (!res.ok) {
                return callback(parseError(res));
            }

            callback(null, res.body);

        });
};

exports.transition = function (issueId, transitionId, callback) {

    var query = 'issue/' + issueId + '/transitions';

    setupPostRequest(query)
        .send({ transition: { id: transitionId }})
        .end(function (res) {

            if (!res.ok) {
                return callback(parseError(res));
            }


            callback(null, {
                issueId: issueId,
                transitionName: transitionId
            });

        });

};

exports.listTransitions = function (issueId, callback) {

    var query = 'issue/' + issueId + '/transitions?expand=transitions.fields';

    setupGetRequest(query)
        .end(function (res) {

            if (!res.ok) {
                return callback(parseError(res));
            }

            callback(null, res.body.transitions);

        });
};

exports.meta = function (filterParams, callback) {
    filterParams.expand = 'projects.issuetypes.fields';

    var possibleFilters = {
        issuetypeNames: undefined,
        projectKeys: undefined,
        expand: undefined
    };

    var query = 'issue/createmeta?';
    query += buildQuery(Object.keys(possibleFilters), filterParams, '&');


    setupGetRequest(query)
        .end(function (res) {

            if (!res.ok) {
                return callback(parseError(res));
            }

            callback(null, res.body.projects);
        });
};

exports.priorities = function (callback) {

    var query = 'priority';

    setupGetRequest(query)
        .end(function (res) {
            if (!res.ok) {
                return callback(parseError(res));
            }

            callback(null, res.body);
        });
};

exports.newIssue = function (issue, callback) {
    var query = 'issue';

    setupPostRequest(query)
        .send(JSON.stringify(issue))
        .end(function (res) {
            if (!res.ok) {
                return callback(parseError(res));
            }

            callback(null, res.body);

        });
};

/* Project */

exports.projects = function(callback) {
    var query = 'project';

    setupGetRequest(query)
        .end(function (res) {
            if (!res.ok) {
                return callback(parseError(res));
            }

            callback(null, res.body);

        });
};

exports.project = function (projectId, callback) {
    var query = 'project/' + projectId;

    setupGetRequest(query)
        .end(function (res) {
            if (!res.ok) {
                return callback(parseError(res));
            }

            callback(null, res.body);

        });
};

exports.versions = function (projectId, callback) {
    var query = 'project/' + projectId + '/versions';

    setupGetRequest(query).end(function (res) {
        if (!res.ok) {
            return callback(parseError(res));
        }

        callback(null, res.body);
    });
};


/* Users */

exports.assignable = function (queries, callback) {
    var possibleFilters = {
        username: undefined,
        project: undefined,
        issueKey: undefined,
        startAt: undefined,
        maxResults: undefined
    };

    var query = 'user/assignable/search?';
    query += buildQuery(Object.keys(possibleFilters), queries, '&');

    setupGetRequest(query).end(function (res) {
        if (!res.ok) {
            return callback(parseError(res));
        }

        callback(null, res.body);
    });
};