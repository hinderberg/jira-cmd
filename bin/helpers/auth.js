var auth = require('../../lib/auth');
var prompt = require('prompt');

exports.setConfig = function(callback){
  callback = callback || function() {};

  if (auth.isAuth()) {
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
      }
    }
  };

  prompt.get(schema, function (err, result) {
    auth.saveConfig(result);
    console.log('Config is stored!');
    return callback(true);
  });
};

exports.clearConfig = function(callback) {
  callback = callback || function() {};

  var schema = {
    properties: {
      yesno: {
        message: 'This will clear your config, are you sure?',
        validator: /y[es]*|n[o]?/,
        warning: 'Must respond yes or no',
        default: 'no'
      }
    }
  };

  prompt.get(schema, function (err, result) {
    if (result.yesno === 'yes') {
      auth.clearConfig();
      console.log('Configuration deleted successfully!');
    }

    callback(null, result);
  });

};



