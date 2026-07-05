import type { DdysConfig } from '../client/config';
import { DdysClient } from '../client/client';
import { DdysError } from '../client/error';
import type { DdysRequestInput } from '../types/ddys';
import { scalar } from '../utils/security';

const globalStore = globalThis as typeof globalThis & { __ddysReactRouterRateLimit?: Map<string, number> };

export interface DdysRequestSubmitOptions {
  identity?: string;
  request?: Request;
}

export async function createRequestFormToken(config: DdysConfig, identity = 'anonymous') {
  if (!config.requestForm.enabled) return '';
  if (!config.requestForm.secret && !config.apiKey) throw new DdysError('DDYS form secret is not configured.', 500, 'GET', '/request');
  const expires = Math.floor(Date.now() / 1000) + config.requestForm.tokenTtlSeconds;
  const subject = hexEncode(identity);
  const payload = `${subject}:${expires}`;
  return `${payload}:${await hmac(config.requestForm.secret || config.apiKey || '', payload)}`;
}

export async function verifyRequestFormToken(config: DdysConfig, token: unknown, identity = 'anonymous') {
  if (!config.requestForm.enabled || !config.requestForm.csrf) return true;
  if (!config.requestForm.secret && !config.apiKey) throw new DdysError('DDYS form secret is not configured.', 500, 'POST', '/request');
  const parts = String(token || '').split(':');
  if (parts.length !== 3) throw new DdysError('Invalid request token.', 403, 'POST', '/request');
  const [subject = '', expiresText = '', signature = ''] = parts;
  if (hexDecode(subject) !== identity && subject !== identity) throw new DdysError('Invalid request token subject.', 403, 'POST', '/request');
  const expires = Number(expiresText);
  if (!Number.isFinite(expires) || expires < Math.floor(Date.now() / 1000)) throw new DdysError('Request token expired.', 403, 'POST', '/request');
  const expected = await hmac(config.requestForm.secret || config.apiKey || '', `${subject}:${expiresText}`);
  if (!timingSafeEqual(signature, expected)) throw new DdysError('Invalid request token signature.', 403, 'POST', '/request');
  return true;
}

export function normalizeRequestInput(input: Record<string, unknown>, config: DdysConfig): DdysRequestInput {
  const honeypot = scalar(input[config.requestForm.honeypotField] || input.honeypot);
  if (honeypot) throw new DdysError('Spam request rejected.', 400, 'POST', '/request');
  const title = scalar(input.title).slice(0, 120);
  if (!title) throw new DdysError('Title is required.', 400, 'POST', '/request');
  const year = scalar(input.year).slice(0, 12);
  if (year && !/^\d{4}$/.test(year)) throw new DdysError('Invalid year.', 400, 'POST', '/request');
  const type = scalar(input.type).toLowerCase().slice(0, 40);
  const doubanId = scalar(input.doubanId || input.douban_id).slice(0, 40);
  const imdbId = scalar(input.imdbId || input.imdb_id).slice(0, 40);
  return {
    title,
    year,
    type: (type || '') as DdysRequestInput['type'],
    douban_id: doubanId,
    imdb_id: imdbId,
    description: scalar(input.description || input.note).slice(0, 1000),
    site: 'React Router'
  };
}

export function enforceRateLimit(config: DdysConfig, identity = 'anonymous') {
  globalStore.__ddysReactRouterRateLimit ??= new Map();
  const now = Date.now();
  const key = `ddys:${identity}`;
  const previous = globalStore.__ddysReactRouterRateLimit.get(key) || 0;
  if (previous && now - previous < config.requestForm.rateLimitSeconds * 1000) throw new DdysError('Please wait before submitting another request.', 429, 'POST', '/request');
  globalStore.__ddysReactRouterRateLimit.set(key, now);
}

export async function submitDdysRequest(config: DdysConfig, raw: Record<string, unknown>, options: DdysRequestSubmitOptions = {}) {
  if (!config.requestForm.enabled) throw new DdysError('DDYS request form is disabled.', 403, 'POST', '/request');
  const identity = options.identity || 'anonymous';
  await verifyRequestFormToken(config, raw.ddys_token || raw.token, identity);
  const input = normalizeRequestInput(raw, config);
  enforceRateLimit(config, identity);
  return new DdysClient(config, fetch).createRequest(input);
}

export function identityFromRequest(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const realIp = request.headers.get('x-real-ip');
  return forwarded || realIp || 'anonymous';
}

async function hmac(secret: string, payload: string) {
  if (!globalThis.crypto?.subtle) throw new DdysError('Web Crypto API is not available.', 500, 'POST', '/request');
  const key = await globalThis.crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await globalThis.crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(signature)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function hexEncode(value: string) {
  return Array.from(new TextEncoder().encode(value)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function hexDecode(value: string) {
  if (!/^(?:[0-9a-f]{2})*$/i.test(value)) return '';
  const bytes = new Uint8Array(value.match(/../g)?.map((part) => Number.parseInt(part, 16)) || []);
  return new TextDecoder().decode(bytes);
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}
