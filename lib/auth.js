var fs = require('fs');
var config = require('./config');

var fullPath = config.cfgPath + config.cfgFile;
var cfgPath = config.cfgPath;

exports.isAuth = function () {
    if (fs.existsSync(fullPath)) {
        config.auth = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
        return true;
    } else {
        return false;
    }
};

exports.clearConfig = function () {
    fs.unlinkSync(fullPath);
    fs.rmdirSync(cfgPath);
};

exports.saveConfig = function (options) {
    fs.mkdirSync(cfgPath);

    if (options.url) {
        if (options.url[options.length - 1] !== '/') {
            options.url += '/';
        }
    }
    if (options.user && options.pass) {
        options.token = options.user + ':' + options.pass;
        options.token = new Buffer(options.token).toString('base64');
        delete options.pass;
    }

    fs.writeFileSync(fullPath, JSON.stringify(options));
    config.auth = options;
};

