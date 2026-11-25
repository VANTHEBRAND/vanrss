import {createRemoteJWKSet, jwtVerify} from 'jose';

let cachedIssuer;
let keys;

export default async function requireAdminAccess({request, env, next}) {
  const issuer = env.CF_ACCESS_ISSUER;
  const audience = env.CF_ACCESS_AUD;
  if (!issuer || !/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/.test(issuer) || !audience) {
    return new Response('Admin access is not configured', {status: 503});
  }

  const token = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!token) return new Response('Forbidden', {status: 403});

  try {
    if (cachedIssuer !== issuer) {
      keys = createRemoteJWKSet(new URL('/cdn-cgi/access/certs', issuer));
      cachedIssuer = issuer;
    }
    await jwtVerify(token, keys, {issuer, audience, algorithms: ['RS256'], requiredClaims: ['exp']});
  } catch {
    return new Response('Forbidden', {status: 403});
  }
  return next();
}
