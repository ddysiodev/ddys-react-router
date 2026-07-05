import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const root = process.cwd();

test('runtime version matches package version', async () => {
  const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
  const { DDYS_REACT_ROUTER_VERSION } = await import('../src/client/config.ts');
  assert.equal(DDYS_REACT_ROUTER_VERSION, pkg.version);
});

test('request tokens support IPv6 identities and legacy identity tokens', async () => {
  const { DEFAULT_DDYS_CONFIG } = await import('../src/client/config.ts');
  const { createRequestFormToken, verifyRequestFormToken } = await import('../src/server/request-service.ts');
  const config = {
    ...DEFAULT_DDYS_CONFIG,
    apiKey: 'test-api-key',
    requestForm: { ...DEFAULT_DDYS_CONFIG.requestForm, enabled: true, secret: 'test-form-secret' }
  };
  const identity = `2001:db8::${Date.now()}`;
  const token = await createRequestFormToken(config, identity);
  assert.equal(await verifyRequestFormToken(config, token, identity), true);

  const legacyIdentity = `127.0.0.${Date.now() % 255}`;
  const expires = Math.floor(Date.now() / 1000) + config.requestForm.tokenTtlSeconds;
  const payload = `${legacyIdentity}:${expires}`;
  const key = await globalThis.crypto.subtle.importKey('raw', new TextEncoder().encode(config.requestForm.secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = Array.from(new Uint8Array(await globalThis.crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload)))).map((byte) => byte.toString(16).padStart(2, '0')).join('');
  assert.equal(await verifyRequestFormToken(config, `${payload}:${signature}`, legacyIdentity), true);
});

test('revalidate resource route requires a configured token', async () => {
  const { createDdysRevalidateResourceRoute } = await import('../src/resource-routes/revalidate.ts');
  const noToken = createDdysRevalidateResourceRoute({ config: { revalidateToken: '' } });
  const missingConfig = await noToken(eventFor({}));
  assert.equal(missingConfig.status, 403);

  const handler = createDdysRevalidateResourceRoute({ config: { revalidateToken: 'secret' } });
  const rejected = await handler(eventFor({ token: 'wrong' }));
  assert.equal(rejected.status, 403);
  const accepted = await handler(eventFor({ token: 'secret' }));
  assert.equal(accepted.status, 200);
  assert.equal((await accepted.json()).success, true);
});

function eventFor(body) {
  return {
    request: new Request('https://example.test/api/ddys/revalidate', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
  };
}
