const fs = require('fs');
const toml = require('toml');
const https = require('https');
const {spawnSync} = require('child_process');

class VarsReader {
  constructor(currentEnv, varsFilePath = '.vars.toml') {
    const varsBuffer = fs.readFileSync(varsFilePath);
    this.data = toml.parse(varsBuffer);
    this.currentEnv = currentEnv;
  }

  get(key, defaultValue = null) {
    const envDict = this.data[this.currentEnv] || {};
    return envDict[key] || this.data[key] || defaultValue;
  }

  flattenVars() {
    const varDict = {};
    const keys = Object.keys(this.data).filter((k) => !['production', 'preview', 'development'].includes(k))
    keys.forEach((k) => {
      varDict[k] = this.get(k, '');
    });
    return varDict;
  }
}

class WranglerCmd {
  constructor(currentEnv) {
    this.currentEnv = currentEnv;
    this.v = new VarsReader(currentEnv);
  }

  runWrangler(args) {
    const result = spawnSync('wrangler', args, {
      env: {
        ...process.env,
        CLOUDFLARE_ACCOUNT_ID: this.v.get('CLOUDFLARE_ACCOUNT_ID') || '',
        CLOUDFLARE_API_TOKEN: this.v.get('CLOUDFLARE_API_TOKEN') || '',
      },
      stdio: 'ignore',
    });
    if (result.status !== 0) throw new Error(`Wrangler ${args.slice(0, 2).join(' ')} failed`);
  }

  publishProject() {
    const productionBranch = this.v.get('PRODUCTION_BRANCH', 'main');
    const branch = this.currentEnv === 'production' ? productionBranch : `${productionBranch}-preview`;
    this.runWrangler(['pages', 'publish', 'public', '--project-name', this.v.get('CLOUDFLARE_PROJECT_NAME'), '--branch', branch]);
  }

  _non_dev_db() {
    return `${this.v.get('CLOUDFLARE_PROJECT_NAME')}_feed_db_${this.currentEnv}`;
  }

  createFeedDb() {
    this.runWrangler(['d1', 'create', this._non_dev_db()]);
  }

  createFeedDbTables() {
    const target = this.currentEnv === 'development' ? ['FEED_DB', '--local'] : [this._non_dev_db()];
    this.runWrangler(['d1', 'execute', ...target, '--file', 'ops/db/init.sql']);
  }

  /**
   * XXX: We use private api here, which may be changed on the cloudflare end...
   * https://github.com/cloudflare/wrangler2/blob/main/packages/wrangler/src/d1/list.tsx#L34
   */
  getDatabaseId(onSuccess) {
    const dbName = this.currentEnv !== 'development' ? this._non_dev_db() : 'FEED_DB';
    const accountId = this.v.get('CLOUDFLARE_ACCOUNT_ID');
    const apiKey = this.v.get('CLOUDFLARE_API_TOKEN');
    const options = {
      host: 'api.cloudflare.com',
      port: '443',
      path: `/client/v4/accounts/${accountId}/d1/database?name=${dbName}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    };
    const request = https.request(options, (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data = data + chunk.toString();
      });

      response.on('end', () => {
        let body;
        try {
          body = JSON.parse(data);
        } catch {
          throw new Error('Invalid Cloudflare D1 response');
        }
        if (response.statusCode !== 200 || !body.success || !Array.isArray(body.result)) {
          throw new Error(`Cloudflare D1 lookup failed (HTTP ${response.statusCode})`);
        }
        const database = body.result.find(result => result.name === dbName);
        onSuccess(database ? database.uuid : '');
      });
    })

    request.on('error', () => { throw new Error('Cloudflare D1 lookup failed'); });

    request.end();
  }
}

module.exports = {
  VarsReader,
  WranglerCmd,
};
