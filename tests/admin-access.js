const assert = require('node:assert/strict');
const test = require('node:test');
const {exportJWK, generateKeyPair, SignJWT} = require('jose');
const {default: requireAdminAccess} = require('../edge-src/common/requireAdminAccess.js');

test('admin requests require a valid Cloudflare Access assertion', async (t) => {
  const issuer = 'https://test-team.cloudflareaccess.com';
  const audience = 'test-admin-app';
  const env = {CF_ACCESS_ISSUER: issuer, CF_ACCESS_AUD: audience};
  const {publicKey, privateKey} = await generateKeyPair('RS256');
  const jwk = {...await exportJWK(publicKey), kid: 'local-test-key'};
  const fetchKeys = t.mock.method(globalThis, 'fetch', async url => {
    assert.equal(String(url), issuer + '/cdn-cgi/access/certs');
    return Response.json({keys: [jwk]});
  });

  async function check(token, settings, expectedStatus) {
    const request = new Request('https://example.invalid/admin/ajax/r2-ops', {
      headers: token ? {'Cf-Access-Jwt-Assertion': token} : {},
    });
    const next = t.mock.fn(() => new Response(null, {status: 204}));
    const response = await requireAdminAccess({request, env: settings, next});
    assert.equal(response.status, expectedStatus);
    assert.equal(next.mock.callCount(), expectedStatus === 204 ? 1 : 0);
  }

  const now = Math.floor(Date.now() / 1000);
  const claims = {iss: issuer, aud: audience, exp: now + 120};
  const sign = (payload, key = privateKey) => new SignJWT(payload)
    .setProtectedHeader({alg: 'RS256', kid: jwk.kid}).sign(key);
  const token = await sign(claims);

  await t.test('absent or invalid configuration closes the route before key lookup', async () => {
    for (const settings of [
      {},
      {CF_ACCESS_AUD: audience},
      {CF_ACCESS_ISSUER: issuer},
      {...env, CF_ACCESS_ISSUER: false},
      {...env, CF_ACCESS_AUD: ''},
      {...env, CF_ACCESS_ISSUER: 'https://example.invalid'},
    ]) {
      await check(token, settings, 503);
    }
    assert.equal(fetchKeys.mock.callCount(), 0);
  });

  await t.test('a missing assertion is rejected and a valid assertion reaches the handler', async () => {
    await check(undefined, env, 403);
    await check(token, env, 204);
  });

  await t.test('issuer, audience, expiry and signature must all match', async () => {
    await check(await sign({...claims, iss: 'https://other.cloudflareaccess.com'}), env, 403);
    await check(await sign({...claims, aud: 'another-application'}), env, 403);
    await check(await sign({...claims, exp: now - 1}), env, 403);
    await check(await sign({iss: issuer, aud: audience}), env, 403);
    const otherKey = await generateKeyPair('RS256');
    await check(await sign(claims, otherKey.privateKey), env, 403);
    assert.equal(fetchKeys.mock.callCount(), 1);
  });
});
