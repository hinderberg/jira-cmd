var prompt = require('prompt');
var projectsLogger = require('../../lib/log/projects');
var prioritiesLogger = require('../../lib/log/priorities');
var issuesLogger = require('../../lib/log/issues');
var _ = require('underscore');
var jira = require('../../lib/jira');

function getProject(id, projects) {
    return _.find(projects, function(project) {
       return project.id === id;
    });
}

function getPriority(id, priorities) {
    return _.find(priorities, function(prirotiy) {
        return prirotiy.id === id;
    });
}

function mapIssue(result, projects) {
    result.project = getProject(result.project, projects);

    return {
        fields: {
            project: {
                id: result.project.id
            },
            issuetype: {
                id: result.issueType
            },
            summary: result.summary,
            description: result.description,
            priority: {
                id: result.priority
            }

        }
    };
}

exports.prompt = function(projects, priorities) {
    console.log('\nProjects');
    projectsLogger.projects(null, projects);
    console.log('\nPriorities');
    prioritiesLogger.priorities(null, priorities);

    var schema = {
        properties: {
            project: {
                description: 'Choose project',
                message: 'You need to choose a project',
                required: true,
                type: 'string',
                conform: function(value) {
                    return getProject(value, projects) ? true : false;
                }
            },
            parent: {
                description: 'Is sub-task',
                message: 'Is sub-task?',
                validator: /yes*|no?/,
                warning: 'Must respond yes or no',
                default: 'no'
            },
            issueType: {
                description: 'Issue type',
                type: 'string',
                required: true
            },
            summary: {
                minLength: 4,
                description: 'Title',
                type: 'string',
                required: true
            },
            description: {
                description: 'Write a description'
            },
            priority: {
                description: 'Priority',
                type: 'string',
                required: true,
                conform: function(value) {
                    return getPriority(value, priorities) ? true : false;
                }
            }
        }
    };

    var schemaSub = {
        properties: {
            taskKey: {
                description: 'Parent task key',
                message: 'You need to specify a parent task key',
                required: true,
                type: 'string'
            }
        }
    };

    prompt.get(schema, function (err, result) {

        var issue = mapIssue(result, projects);

        if (result.parent === 'yes') {
            prompt.get(schemaSub, function (err, subResult) {
                issue.fields.parent = {
                    key: subResult.taskKey
                };

                jira.newIssue(issue, issuesLogger.createIssue);
            });
        } else {
            jira.newIssue(issue, issuesLogger.createIssue);
        }
    });
};