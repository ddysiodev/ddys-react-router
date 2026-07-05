import { DDYS_REACT_ROUTER_VERSION, type DdysConfigInput } from '../client/config';
import { DdysError } from '../client/error';
import { ddysCacheStats } from '../server/cache';
import { createDdysServerClient } from '../server/client';
import { getDdysConfig, safeDdysConfig } from '../server/config';
import type { DdysActionArgs, DdysRouteArgs } from '../loaders';

export interface DdysDiagnosticsResourceOptions {
  config?: DdysConfigInput;
}

export function createDdysDiagnosticsResourceRoute(options: DdysDiagnosticsResourceOptions = {}) {
  return async function loader(_args: DdysRouteArgs) {
    const config = getDdysConfig(options.config);
    if (!config.diagnostics.enabled) return Response.json({ success: false, message: 'DDYS diagnostics is disabled.' }, { status: 403 });
    return Response.json({ success: true, data: { version: DDYS_REACT_ROUTER_VERSION, runtime: typeof process === 'object' ? 'node' : 'web', reactRouter: 'framework-mode', config: safeDdysConfig(config), cache: ddysCacheStats(), views: config.proxy.allowRoutes, resourceRoutes: ['/api/ddys/proxy', '/api/ddys/request', '/api/ddys/diagnostics', '/api/ddys/revalidate', '/sitemap.xml', '/robots.txt', '/manifest.webmanifest', '/favicon.ico'] } });
  };
}

export function createDdysDiagnosticsTestResourceRoute(options: DdysDiagnosticsResourceOptions = {}) {
  return async function action(_args: DdysActionArgs) {
    const config = getDdysConfig(options.config);
    if (!config.diagnostics.enabled) return Response.json({ success: false, message: 'DDYS diagnostics is disabled.' }, { status: 403 });
    try {
      return Response.json({ success: true, data: await createDdysServerClient(options.config).get('/latest', { limit: 1 }, { noCache: true }) });
    } catch (error) {
      return Response.json({ success: false, message: error instanceof DdysError ? error.message : 'DDYS diagnostics test failed.' }, { status: 500 });
    }
  };
}

export const ddysDiagnosticsLoader = createDdysDiagnosticsResourceRoute();
export const ddysDiagnosticsAction = createDdysDiagnosticsTestResourceRoute();
