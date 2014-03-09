var program = require('commander');
var auth = require('./auth');

exports.run = function() {
    if (program.args.length === 0) {
        auth.setConfig(function (auth) {
            if (auth) {
                program.help();
            }
        });
    }
};