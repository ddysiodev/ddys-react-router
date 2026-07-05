import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('ddys', 'routes/ddys-layout.tsx', [
    index('routes/ddys.tsx'),
    route('latest', 'routes/ddys.latest.tsx'),
    route('hot', 'routes/ddys.hot.tsx'),
    route('movies', 'routes/ddys.movies.tsx'),
    route('search', 'routes/ddys.search.tsx'),
    route('calendar', 'routes/ddys.calendar.tsx'),
    route('collections', 'routes/ddys.collections.tsx'),
    route('shares', 'routes/ddys.shares.tsx'),
    route('types', 'routes/ddys.types.tsx'),
    route('genres', 'routes/ddys.genres.tsx'),
    route('regions', 'routes/ddys.regions.tsx'),
    route('request', 'routes/ddys.request.tsx'),
    route('diagnostics', 'routes/ddys.diagnostics.tsx'),
    route('movie/:slug', 'routes/ddys.movie.$slug.tsx'),
    route('movie/:slug/sources', 'routes/ddys.movie.$slug.sources.tsx')
  ]),
  route('api/ddys/proxy', 'routes/api.ddys.proxy.ts'),
  route('api/ddys/request', 'routes/api.ddys.request.ts'),
  route('api/ddys/diagnostics', 'routes/api.ddys.diagnostics.ts'),
  route('api/ddys/revalidate', 'routes/api.ddys.revalidate.ts'),
  route('sitemap.xml', 'routes/sitemap.xml.ts'),
  route('robots.txt', 'routes/robots.txt.ts'),
  route('manifest.webmanifest', 'routes/manifest.webmanifest.ts'),
  route('favicon.ico', 'routes/favicon.ico.ts')
] satisfies RouteConfig;
