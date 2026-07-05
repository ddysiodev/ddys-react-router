import { DdysError } from '../client/error';
import type { DdysConfigInput } from '../client/config';
import { cachedDdys } from '../server/cache';
import { createDdysServerClient } from '../server/client';
import { cleanRuntimeQuery } from '../utils/security';
import type { DdysRouteArgs } from '../loaders';

export interface DdysProxyResourceOptions {
  config?: DdysConfigInput;
  cache?: boolean;
}

export function createDdysProxyResourceRoute(options: DdysProxyResourceOptions = {}) {
  return async function loader(args: DdysRouteArgs) {
    const url = new URL(args.request.url);
    const route = String(args.params?.route || url.searchParams.get('route') || '');
    const query = { ...cleanRuntimeQuery(url.searchParams), slug: url.searchParams.get('slug') || undefined, id: url.searchParams.get('id') || undefined, username: url.searchParams.get('username') || undefined };
    const noCache = url.searchParams.get('noCache') === '1' || url.searchParams.get('noCache') === 'true';
    try {
      const client = createDdysServerClient(options.config);
      if (!client.config.proxy.enabled) return json({ success: false, message: 'DDYS proxy is disabled.' }, 404);
      const payload = options.cache === false ? await client.proxy(route, query, { noCache }) : await cachedDdys(client, route, query, noCache);
      return json(payload, 200, noCache ? 'private, no-store' : `public, max-age=${Math.min(60, client.config.cache.defaultTtl)}`);
    } catch (error) {
      return errorJson(error);
    }
  };
}

export const ddysProxyLoader = createDdysProxyResourceRoute();

function json(payload: unknown, status = 200, cacheControl = 'private, no-store') {
  return Response.json(payload, { status, headers: { 'Cache-Control': cacheControl } });
}

function errorJson(error: unknown) {
  return error instanceof DdysError
    ? json({ success: false, message: error.message, status: error.status }, error.status >= 400 ? error.status : 500)
    : json({ success: false, message: error instanceof Error ? error.message : 'DDYS proxy failed.' }, 500);
}
