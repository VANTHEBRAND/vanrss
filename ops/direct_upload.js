const {WranglerCmd} = require('./lib/utils');

const cmd = new WranglerCmd(process.env.DEPLOYMENT_ENVIRONMENT || 'production');
cmd.publishProject();
console.log('Cloudflare Pages deployment completed.');
