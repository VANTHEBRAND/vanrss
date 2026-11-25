const https = require('https');
const {VarsReader, WranglerCmd} = require('./lib/utils');

const ALLOWED_VARS = [
  {name: 'CLOUDFLARE_ACCOUNT_ID', encrypted: true},
  {name: 'CLOUDFLARE_PROJECT_NAME', encrypted: true},
  {name: 'DEPLOYMENT_ENVIRONMENT', encrypted: false},
  {name: 'CF_ACCESS_ISSUER', encrypted: false},
  {name: 'CF_ACCESS_AUD', encrypted: false},

  {name: 'R2_ACCESS_KEY_ID', encrypted: true},
  {name: 'R2_SECRET_ACCESS_KEY', encrypted: true},
  {name: 'R2_PUBLIC_BUCKET', encrypted: true},

  {name: 'NODE_VERSION', encrypted: false},  // Cloudflare Pages CI needs this to use the right Node version.
  {name: 'MICROFEED_VERSION', encrypted: false},
];

class SyncProjectConfig {
  constructor() {
    this.currentEnv = process.env.DEPLOYMENT_ENVIRONMENT || 'production';
    this.v = new VarsReader(this.currentEnv);
    this.cmd = new WranglerCmd(this.currentEnv);
  }

  _getEnvVarsFromFilesJson(envName, databaseId) {
    // https://api.cloudflare.com/#pages-project-get-projects
    const envVarsJson = {
      [envName]: {
        'env_vars': {
          'DEPLOYMENT_ENVIRONMENT': this.currentEnv,
        },
      },
    };
    if (databaseId) {
      envVarsJson[envName]['d1_databases'] = {
        FEED_DB: {
          id: databaseId,
        }
      };
    }
    ALLOWED_VARS.forEach((varDict) => {
      const varValue = this.v.get(varDict.name) || '';
      envVarsJson[envName]['env_vars'][varDict.name] = {
        'value': varValue,
        'type': varDict.encrypted ? 'secret_text' : 'plain_text',
      };
    });
    // GitHub direct uploads use the deploy token only in CI. Remove the legacy runtime binding.
    envVarsJson[envName].env_vars.CLOUDFLARE_API_TOKEN = process.env.GITHUB_ACTIONS === 'true'
      ? null
      : {type: 'secret_text', value: this.v.get('CLOUDFLARE_API_TOKEN')};
    return envVarsJson;
  }

  _updateEnvVars(data, onSuccess) {
    const options = {
      hostname: 'api.cloudflare.com',
      port: 443,
      path: `/client/v4/accounts/${this.v.get('CLOUDFLARE_ACCOUNT_ID')}/pages/projects/${this.v.get('CLOUDFLARE_PROJECT_NAME')}`,
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.v.get('CLOUDFLARE_API_TOKEN')}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        let json;
        try {
          json = JSON.parse(body);
        } catch {
          throw new Error('Invalid Cloudflare project configuration response');
        }
        if (res.statusCode !== 200 || !json.success) {
          throw new Error(`Cloudflare project configuration failed (HTTP ${res.statusCode})`);
        }
        onSuccess();
      });
    });

    req.on('error', () => { throw new Error('Cloudflare project configuration request failed'); });
    req.write(data)
    req.end();
  }

  syncEnvVars() {
    console.log(`Sync-ing for [${this.currentEnv}]...`);

    this.cmd.getDatabaseId((databaseId) => {
      if (!databaseId) throw new Error('Feed database missing for the selected environment');
      const varsToAddOrUpdate = JSON.stringify({
        'deployment_configs': {
          ...this._getEnvVarsFromFilesJson(this.currentEnv, databaseId),
        },
      });

      this._updateEnvVars(varsToAddOrUpdate, () => {
        console.log(`Updated Pages configuration for ${this.currentEnv}.`);
      });
    });
  }
}

const syncProjectConfig = new SyncProjectConfig();
syncProjectConfig.syncEnvVars();
