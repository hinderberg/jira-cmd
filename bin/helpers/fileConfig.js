var prompt = require('prompt');
var fs = require('fs');
var config = require('../../lib/config');
var _ = require('underscore');
var yesno = require('./yesno');

var fullPath = config.cfgPath + config.cfgFile;
var cfgPath = config.cfgPath;

function isConfigured() {
    if (fs.existsSync(fullPath)) {
        config.fileConfig = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));

        if (config.fileConfig.url &&
            config.fileConfig.token) {
            return true;
        }

        return false;
    } else {
        return false;
    }
}

isConfigured();

function clearConfig() {
    if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
    }

    if (fs.existsSync(cfgPath)) {
        fs.rmdirSync(cfgPath);
    }
}

function saveConfig(options) {
    options = options || {};
    clearConfig();
    fs.mkdirSync(cfgPath);

    if (options.user && options.pass) {
        options.token = options.user + ':' + options.pass;
        options.token = new Buffer(options.token).toString('base64');
        delete options.pass;
    }

    fs.writeFileSync(fullPath, JSON.stringify(options));
    config.fileConfig = options;
}

exports.setConfigProperties = function(options) {
    options = _.pick(options, ['url', 'defaultProject', 'defaultVersion', 'allowedFields']);
    config.fileConfig = _.extend(config.fileConfig, options);

    saveConfig(config.fileConfig);
    console.log('Config is stored!');
};

exports.setConfig = function (callback) {
    callback = callback || function () {
    };

    if (isConfigured()) {
        return callback(true);
    }

    var schema = {
        properties: {
            url: {
                description: 'Jira URL',
                required: true
            },
            user: {
                description: 'Username',
                required: true
            },
            pass: {
                description: 'Password',
                hidden: true,
                required: true
            },
            defaultProject: {
                description: 'Default project',
                required: false
            },
            defaultVersion: {
                description: 'Default version',
                required: false
            }
        }
    };

    prompt.get(schema, function (err, result) {
        saveConfig(result);
        console.log('Config is stored!');
        return callback(true);
    });
};

exports.clearConfig = function (callback) {
    callback = callback || function () {};

    var schema = {
        properties: {
            yesno: yesno('This will clear your config, are you sure?')
        }
    };

    prompt.get(schema, function (err, result) {
        if (result.yesno === 'yes') {
            clearConfig();
            console.log('Configuration deleted successfully!');
        }

        callback(null, result);
    });
};