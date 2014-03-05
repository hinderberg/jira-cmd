module.exports = {
    cfgPath: process.env.HOME + '/.jira/',
    cfgFile: 'config.json',
    auth: {},
    defaultProject: process.env.DEFAULT_PROJECT || '',
    defaultVersion: process.env.DEFAULT_VERSION || ''
};