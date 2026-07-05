import type { DdysConfig, DdysConfigInput } from '../client/config';
import type { DdysItem } from '../types/ddys';
import { createDdysServerClient } from '../server/client';
import { getDdysConfig } from '../server/config';
import { itemPoster, itemSummary, itemTitle, itemUrl } from '../components/utils';

export interface DdysSeoInput {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  siteName?: string;
}

export interface DdysSitemapOptions {
  config?: DdysConfigInput;
  basePath?: string;
  includeLatest?: boolean;
  latestLimit?: number;
  staticPaths?: string[];
}

export function createDdysSeo(config: DdysConfig, input: DdysSeoInput = {}) {
  const siteName = input.siteName ?? 'DDYS';
  const title = input.title ?? siteName;
  const description = input.description ?? 'DDYS API powered movie and video experience.';
  const canonical = absoluteUrl(config.siteBaseUrl, input.path ?? config.reactRouter.mountPath);
  const image = input.image ? absoluteUrl(config.siteBaseUrl, input.image) : undefined;
  return { title, description, canonical, openGraph: { title, description, url: canonical, siteName, image }, twitter: { card: image ? 'summary_large_image' : 'summary', title, description, image } };
}

export function createDdysMovieSeo(config: DdysConfig, movie: DdysItem) {
  const title = itemTitle(movie);
  return createDdysSeo(config, { title, description: itemSummary(movie) || `${title} - DDYS`, path: itemUrl(movie, config.siteBaseUrl) || `${config.reactRouter.mountPath}/movie/${encodeURIComponent(String(movie.slug || ''))}`, image: itemPoster(movie) });
}

export function createDdysMovieJsonLd(movie: DdysItem, configInput: DdysConfigInput | DdysConfig = {}) {
  const config = 'cache' in configInput ? configInput : getDdysConfig(configInput);
  const image = itemPoster(movie);
  const url = itemUrl(movie, config.siteBaseUrl);
  return stripEmpty({ '@context': 'https://schema.org', '@type': 'Movie', name: itemTitle(movie), description: itemSummary(movie), image, url, datePublished: movie.year ? String(movie.year) : undefined, genre: Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre, countryOfOrigin: Array.isArray(movie.region) ? movie.region.join(', ') : movie.region, aggregateRating: movie.rating ? { '@type': 'AggregateRating', ratingValue: String(movie.rating), bestRating: '10' } : undefined });
}

export async function createDdysSitemap(options: DdysSitemapOptions = {}) {
  const client = createDdysServerClient(options.config);
  const config = client.config;
  const basePath = normalizePath(options.basePath ?? config.reactRouter.mountPath);
  const staticPaths = options.staticPaths ?? [basePath, joinPath(basePath, 'latest'), joinPath(basePath, 'hot'), joinPath(basePath, 'movies'), joinPath(basePath, 'search'), joinPath(basePath, 'calendar'), joinPath(basePath, 'collections'), joinPath(basePath, 'shares'), joinPath(basePath, 'types'), joinPath(basePath, 'genres'), joinPath(basePath, 'regions'), joinPath(basePath, 'request')];
  const urls = new Set(staticPaths.map((path) => absoluteUrl(config.siteBaseUrl, path)).filter(Boolean) as string[]);
  if (options.includeLatest !== false) {
    try {
      for (const item of asItems(await client.latest({ limit: options.latestLimit ?? 24 }))) {
        if (item.slug) urls.add(absoluteUrl(config.siteBaseUrl, joinPath(basePath, `movie/${encodeURIComponent(item.slug)}`)) || '');
      }
    } catch {}
  }
  const now = new Date().toISOString();
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${Array.from(urls).filter(Boolean).map((url) => `  <url><loc>${escapeXml(url)}</loc><lastmod>${now}</lastmod></url>`).join('\n')}\n</urlset>\n`;
}

export function createDdysRobotsText(config: DdysConfig) {
  return [`User-agent: *`, `Allow: /`, `Disallow: ${config.reactRouter.routePrefix}/diagnostics`, `Disallow: ${config.reactRouter.routePrefix}/revalidate`, `Sitemap: ${absoluteUrl(config.siteBaseUrl, '/sitemap.xml')}`].join('\n');
}

export function createDdysManifest(config: DdysConfig) {
  return { name: 'DDYS', short_name: 'DDYS', description: 'DDYS API powered movie and video experience.', start_url: config.reactRouter.mountPath, scope: '/', display: 'standalone', background_color: '#f8fafc', theme_color: '#17324d', icons: [{ src: `${config.reactRouter.assetsPath}/icon-192.png`, sizes: '192x192', type: 'image/png' }, { src: `${config.reactRouter.assetsPath}/icon-512.png`, sizes: '512x512', type: 'image/png' }] };
}

export function createDdysFaviconSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#17324d"/><path d="M16 20h18c8.3 0 14 5 14 12s-5.7 12-14 12H16V20zm10 8v8h8c3 0 5-1.6 5-4s-2-4-5-4h-8z" fill="#ffffff"/><path d="M16 46h32v6H16z" fill="#32b8c6"/></svg>`;
}

function asItems(payload: unknown): DdysItem[] {
  if (Array.isArray(payload)) return payload as DdysItem[];
  if (payload && typeof payload === 'object' && Array.isArray((payload as { data?: unknown }).data)) return (payload as { data: DdysItem[] }).data;
  return [];
}

function absoluteUrl(baseUrl: string, value: string): string | undefined {
  const text = String(value || '').trim();
  if (!text) return undefined;
  try { return new URL(text, baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`).toString(); } catch { return undefined; }
}

function normalizePath(path: string): string {
  const clean = String(path || '/').trim();
  return clean.startsWith('/') ? clean.replace(/\/+$/, '') || '/' : `/${clean.replace(/\/+$/, '')}`;
}

function joinPath(basePath: string, segment: string): string {
  const base = normalizePath(basePath);
  const cleanSegment = String(segment || '').replace(/^\/+/, '').replace(/\/+$/, '');
  return cleanSegment ? `${base === '/' ? '' : base}/${cleanSegment}` : base;
}

function escapeXml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function stripEmpty(input: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined && value !== null && value !== ''));
}
