var Table = require('cli-table');
var _ = require('underscore');


module.exports = function(options) {
    var options = _.extend({
            chars: {
                'top': '-'
                , 'top-mid': '|'
                , 'top-left': '|'
                , 'top-right': '|'
                , 'bottom': '-'
                , 'bottom-mid': '|'
                , 'bottom-left': '|'
                , 'bottom-right': '|'
                , 'left': '|'
                , 'left-mid': '|'
                , 'mid': '-'
                , 'mid-mid': '|'
                , 'right': '|'
                , 'right-mid': '|'
            }
            , truncate: '...'
            , colWidths: []
            , colAligns: []
            , style: {
                'padding-left': 1
                , 'padding-right': 1
                , head: ['cyan']
                , compact : false
            }
            , head: []
    }, options);

    return new Table(options);
};