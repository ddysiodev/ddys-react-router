import type { DdysConfigInput } from '../client/config';
import { publicDdysConfig } from '../client/config';
import type { DdysClient } from '../client/client';
import type { DdysMovie, DdysQuery, DdysViewName } from '../types/ddys';
import { createDdysServerClient } from '../server/client';
import { createDdysMovieJsonLd, createDdysMovieSeo, createDdysSeo } from '../seo';
import { createRequestFormToken, identityFromRequest } from '../server/request-service';

export interface DdysRouteArgs {
  request: Request;
  params?: Record<string, string | undefined>;
  context?: unknown;
}

export interface DdysActionArgs extends DdysRouteArgs {}

export interface DdysLoaderOptions {
  config?: DdysConfigInput;
  params?: DdysQuery;
  fetcher?: typeof fetch;
}

export async function loadDdysView(args: DdysRouteArgs, view: DdysViewName = 'latest', options: DdysLoaderOptions = {}) {
  const client = createDdysServerClient(options.config, options.fetcher);
  const url = new URL(args.request.url);
  const query = { ...queryFromUrl(url), ...options.params };
  return { view, params: query, payload: await dispatchView(client, view, query), config: publicDdysConfig(client.config), seo: createDdysSeo(client.config, { title: titleForView(view), path: pathForView(client.config.reactRouter.mountPath, view) }) };
}

export async function loadDdysMovie(args: DdysRouteArgs, options: DdysLoaderOptions = {}) {
  const client = createDdysServerClient(options.config, options.fetcher);
  const slug = String(args.params?.slug || '');
  const movie = await client.movie(slug) as DdysMovie;
  return { slug, movie, config: publicDdysConfig(client.config), seo: createDdysMovieSeo(client.config, movie), jsonLd: createDdysMovieJsonLd(movie, client.config) };
}

export async function loadDdysSources(args: DdysRouteArgs, options: DdysLoaderOptions = {}) {
  const client = createDdysServerClient(options.config, options.fetcher);
  const slug = String(args.params?.slug || '');
  return { slug, sources: await client.sources(slug), config: publicDdysConfig(client.config), seo: createDdysSeo(client.config, { title: 'DDYS Sources', path: `${client.config.reactRouter.mountPath}/movie/${encodeURIComponent(slug)}/sources` }) };
}

export async function loadDdysRequestForm(args: DdysRouteArgs, options: DdysLoaderOptions = {}) {
  const client = createDdysServerClient(options.config, options.fetcher);
  const token = await createRequestFormToken(client.config, identityFromRequest(args.request));
  return { token, config: publicDdysConfig(client.config), seo: createDdysSeo(client.config, { title: 'DDYS Request', path: `${client.config.reactRouter.mountPath}/request` }) };
}

export async function loadDdysDiagnostics(_args: DdysRouteArgs, options: DdysLoaderOptions = {}) {
  const client = createDdysServerClient(options.config, options.fetcher);
  return { config: publicDdysConfig(client.config), seo: createDdysSeo(client.config, { title: 'DDYS Diagnostics', path: `${client.config.reactRouter.mountPath}/diagnostics` }) };
}

export async function dispatchView(client: DdysClient, view: DdysViewName, params: DdysQuery = {}) {
  switch (view) {
    case 'movies': return client.movies(params);
    case 'latest': return client.latest(params);
    case 'hot': return client.hot(params);
    case 'search': return client.search(params);
    case 'suggest': return client.suggest(String(params.q || ''), params);
    case 'calendar': return client.calendar(params);
    case 'movie': return client.movie(String(params.slug || ''));
    case 'sources': return client.sources(String(params.slug || ''));
    case 'related': return client.related(String(params.slug || ''));
    case 'comments': return client.comments(String(params.slug || ''), params);
    case 'collections': return client.collections(params);
    case 'collection': return client.collection(String(params.slug || ''), params);
    case 'shares': return client.shares(params);
    case 'share': return client.share(String(params.id || ''));
    case 'requests': return client.requests(params);
    case 'activities': return client.activities(params);
    case 'user': return client.user(String(params.username || ''));
    case 'types': return client.types();
    case 'genres': return client.genres();
    case 'regions': return client.regions();
    default: return client.latest(params);
  }
}

function queryFromUrl(url: URL): DdysQuery {
  const out: DdysQuery = {};
  for (const [key, value] of url.searchParams.entries()) out[key] = value;
  return out;
}

function titleForView(view: DdysViewName) {
  return ({ movies: 'DDYS Movies', latest: 'DDYS Latest', hot: 'DDYS Hot', search: 'DDYS Search', calendar: 'DDYS Calendar', collections: 'DDYS Collections', shares: 'DDYS Shares', types: 'DDYS Types', genres: 'DDYS Genres', regions: 'DDYS Regions' } as Record<string, string>)[view] || 'DDYS';
}

function pathForView(mountPath: string, view: DdysViewName) {
  return view === 'latest' ? `${mountPath}/latest` : `${mountPath}/${view}`;
}
