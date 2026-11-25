const {WranglerCmd} = require('./lib/utils');

const environment = process.env.DEPLOYMENT_ENVIRONMENT || 'development';
const cmd = new WranglerCmd(environment);
if (environment === 'development') {
  cmd.createFeedDbTables();
} else {
  cmd.getDatabaseId((databaseId) => {
    if (!databaseId) cmd.createFeedDb();
    cmd.createFeedDbTables();
  });
}
