module.exports = function(message) {
    return {
        description: message || 'Answer yes or no',
        pattern: /y[es]*|n[o]?/,
        message: 'Must respond y[es] or n[o]',
        default: 'no'
    }
};