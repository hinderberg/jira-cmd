var prompt = require('prompt');
var projectsLogger = require('../../lib/log/projects');
var issuesLogger = require('../../lib/log/issues');
var _ = require('underscore');
var jira = require('../../lib/jira');
var yesno = require('./yesno');
var fileConfig = require('./fileConfig');
var config = require('../../lib/config');

function getById(id, objects) {
    return _.find(objects, function(object) {
       return object.id === id;
    });
}

function createProjectSchema(options, meta) {
    return {
        properties: {
            project: {
                description: 'Choose project',
                message: 'You need to choose a project',
                required: true,
                type: 'string',
                conform: function(value) {
                    return getById(value, meta) ? true : false;
                },
                default: options.project
            }
        }
    }
}

function createIssueTypesSchema(issueTypes) {
    return {
        properties: {
            issueType: {
                description: 'Choose issue type',
                type: 'string',
                required: true,
                conform: function(value) {
                    return getById(value, issueTypes) ? true : false
                }
            }
        }
    }
}

var createFieldsSchema = exports.createFieldsSchema = function(fields, allowedFields) {
    var schemaSub = {
        properties: {}
    };

    allowedFields.forEach(function(key) {
        var field = fields[key];

        schemaSub.properties[key] = {
            required: field.required,
            description: field.name
        };

        if (field.allowedValues) {
            schemaSub.properties[key].help = ['The following values are allowed, use the (id)'];
            field.allowedValues.forEach(function(value) {
                schemaSub.properties[key].help.push((value.name || value.value) + ' (' + value.id + ')');
            });

            schemaSub.properties[key].conform = function() {
                var allowedValues = field.allowedValues;
                return function(value) {
                    return getById(value, allowedValues) ? true: false
                }
            }();
        }

        schemaSub.properties[key].before = function(value) {
            switch (field.schema.type) {
                case 'string':
                    return value;
                    break;
                case "array":
                    return [{
                        id: value
                    }];
                    break;
                default:
                    return value;
                    break;
            }
        }


    });

    return schemaSub;
};

function mapIssue(result) {

    /*
     parent: {
     key: undefined // project.key + '-' + taskKey
     }
     */


    var mappedIssue = {
        fields: {
            project: {
                id: result.project.id
            },
            issuetype: {
                id: result.issueType.id
            },
            reporter: {
                name: config.fileConfig.user
            }
        }
    };

    for (var key in result.fields) {
        mappedIssue.fields[key] = result.fields[key];
    }

    return mappedIssue;
}

function createAllowedFieldsSchema(fields) {
    var schemaSub = {
        properties: {}
    };

    for (var key in fields) {
        if (key === 'issuetype' || key === 'project' || key === 'reporter') {
            continue;
        }

        var field = fields[key];

        if (field.allowedValues && field.allowedValues.length <= 0) {
            continue;
        }

        schemaSub.properties[key] = yesno('Do you want to be asked for ' + field.name  + '?');
    }

    return schemaSub;
}

function addNewAllowedFields(projectId, issueTypeId, allowedFieldsResult) {
    config.fileConfig.allowedFields = config.fileConfig.allowedFields || {};
    config.fileConfig.allowedFields[projectId] = config.fileConfig.allowedFields[projectId] || {};
    config.fileConfig.allowedFields[projectId][issueTypeId] = config.fileConfig.allowedFields[projectId][issueTypeId] || [];

    for (var key in allowedFieldsResult) {
        var allow = allowedFieldsResult[key];

        if (allow == 'yes') {
            config.fileConfig.allowedFields[projectId][issueTypeId].push(key);
        }
    }

    fileConfig.setConfigProperties({
        allowedFields:config.fileConfig.allowedFields
    });
}

exports.prompt = function(options) {

    jira.meta({}, function(err, meta) {

        console.log('\nProjects');
        projectsLogger.projects(null, meta);

        var result = {};

        prompt.get(createProjectSchema(options, meta), function (err, projectResult) {

            result.project = getById(projectResult.project, meta);

            prompt.get(createIssueTypesSchema(result.project.issuetypes), function (err, issueTypeResult) {

                result.issueType = getById(issueTypeResult.issueType, result.project.issuetypes);

                function askCustomFields(allowedFields) {
                    prompt.get(createFieldsSchema(result.issueType.fields, allowedFields), function (err, fieldsResult) {
                        result.fields = fieldsResult;
                        var mappedIssue = mapIssue(result);
                        jira.newIssue(mappedIssue, issuesLogger.createIssue);
                    });
                }

                if (!config.fileConfig.allowedFields ||
                    !config.fileConfig.allowedFields[projectResult.project] ||
                    !config.fileConfig.allowedFields[projectResult.project][issueTypeResult.issueType]) {

                    console.log('You need to answer which fields you want to be asked for the first time you use this');
                    prompt.get(createAllowedFieldsSchema(result.issueType.fields), function (err, allowedFieldsResult) {
                        addNewAllowedFields(projectResult.project, issueTypeResult.issueType, allowedFieldsResult);
                        askCustomFields(config.fileConfig.allowedFields[projectResult.project][issueTypeResult.issueType]);
                    });
                } else {
                    askCustomFields(config.fileConfig.allowedFields[projectResult.project][issueTypeResult.issueType]);
                }

            });
        });
    });
};