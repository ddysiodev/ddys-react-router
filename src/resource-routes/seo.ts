import type { DdysConfigInput } from '../client/config';
import { createDdysFaviconSvg, createDdysManifest, createDdysRobotsText, createDdysSitemap } from '../seo';
import { getDdysConfig } from '../server/config';
import type { DdysRouteArgs } from '../loaders';

export interface DdysSeoResourceOptions {
  config?: DdysConfigInput;
}

export function createDdysSitemapResourceRoute(options: DdysSeoResourceOptions = {}) {
  return async function loader(_args: DdysRouteArgs) {
    return new Response(await createDdysSitemap({ config: options.config }), { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=300' } });
  };
}

export function createDdysRobotsResourceRoute(options: DdysSeoResourceOptions = {}) {
  return async function loader(_args: DdysRouteArgs) {
    return new Response(createDdysRobotsText(getDdysConfig(options.config)), { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=300' } });
  };
}

export function createDdysManifestResourceRoute(options: DdysSeoResourceOptions = {}) {
  return async function loader(_args: DdysRouteArgs) {
    return Response.json(createDdysManifest(getDdysConfig(options.config)), { headers: { 'Cache-Control': 'public, max-age=300' } });
  };
}

export function createDdysFaviconResourceRoute(_options: DdysSeoResourceOptions = {}) {
  return async function loader(_args: DdysRouteArgs) {
    return new Response(createDdysFaviconSvg(), { headers: { 'Content-Type': 'image/svg+xml; charset=utf-8', 'Cache-Control': 'public, max-age=86400' } });
  };
}

export const ddysSitemapLoader = createDdysSitemapResourceRoute();
export const ddysRobotsLoader = createDdysRobotsResourceRoute();
export const ddysManifestLoader = createDdysManifestResourceRoute();
export const ddysFaviconLoader = createDdysFaviconResourceRoute();
