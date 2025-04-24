const database = require('./database');
const auth = require('./auth');
const swagger = require('./swagger');
const env = process.env.NODE_ENV || 'development';
const config = require(`./environments/${env}`);

module.exports = {
  config,
  database,
  auth,
  swagger,
};
