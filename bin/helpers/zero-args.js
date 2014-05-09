var program = require('commander');
var fileConfig = require('./fileConfig');

exports.run = function() {
    if (program.args.length === 0) {
        fileConfig.setConfig(function (fileConfig) {
            if (fileConfig) {
                program.help();
            }
        });
    }
};