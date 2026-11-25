const https = require('https');
const {VarsReader} = require('./lib/utils');

const environment = process.env.DEPLOYMENT_ENVIRONMENT || 'production';
const vars = new VarsReader(environment);
const project = vars.get('CLOUDFLARE_PROJECT_NAME');
const projectsPath = `/client/v4/accounts/${vars.get('CLOUDFLARE_ACCOUNT_ID')}/pages/projects`;

function requestProject(method, path, payload) {
  return new Promise((resolve, reject) => {
    const request = https.request({
      hostname: 'api.cloudflare.com',
      path,
      method,
      headers: {
        Authorization: `Bearer ${vars.get('CLOUDFLARE_API_TOKEN')}`,
        'Content-Type': 'application/json',
      },
    }, response => {
      response.resume();
      response.on('end', () => resolve(response.statusCode));
      response.on('error', () => reject(new Error('Could not read Cloudflare response')));
    });
    request.on('error', () => reject(new Error('Cloudflare request failed')));
    request.end(payload);
  });
}

async function ensureProject() {
  const lookup = await requestProject('GET', `${projectsPath}/${project}`);
  if (lookup === 200) {
    console.log('Cloudflare Pages project exists.');
    return;
  }
  if (lookup !== 404) throw new Error(`Cloudflare Pages lookup failed (HTTP ${lookup})`);
  const created = await requestProject('POST', projectsPath, JSON.stringify({
    subdomain: project,
    production_branch: vars.get('PRODUCTION_BRANCH', 'main'),
    name: project,
  }));
  if (created < 200 || created >= 300) throw new Error(`Cloudflare Pages project creation failed (HTTP ${created})`);
  console.log('Cloudflare Pages project created.');
}

ensureProject().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
