# DDYS React Router Integration

[中文](README.zh-CN.md)

`ddys-react-router` is the official React Router Framework Mode integration for the DDYS API. It provides a TypeScript API client, server loaders, actions, resource-routes, React components, cache helpers, SEO helpers, diagnostics, and a secure request form.

## Install

```bash
npm install ddys-react-router react-router react react-dom
```

React Router 8 requires React 19. Use Framework Mode with `@react-router/dev`:

```ts
// vite.config.ts
import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';

export default defineConfig({ plugins: [reactRouter()] });
```

## Environment

```bash
DDYS_API_BASE_URL=https://ddys.io/api/v1
DDYS_SITE_BASE_URL=https://ddys.io
DDYS_API_KEY=
DDYS_FORM_SECRET=
DDYS_REQUEST_FORM_ENABLED=false
DDYS_REQUEST_FORM_CSRF=true
DDYS_DIAGNOSTICS_ENABLED=false
DDYS_REVALIDATE_TOKEN=
```

Keep `DDYS_API_KEY`, `DDYS_FORM_SECRET`, and `DDYS_REVALIDATE_TOKEN` server-side. Do not expose them through public environment variables.

## Loaders

```tsx
import { useLoaderData } from 'react-router';
import { loadDdysView } from 'ddys-react-router/loaders';
import { DdysView } from 'ddys-react-router/components';

export const loader = (args: any) => loadDdysView(args, 'latest', { params: { limit: 24 } });

export default function Latest() {
  const data = useLoaderData<typeof loader>();
  return <DdysView view={data.view} payload={data.payload} siteBaseUrl={data.config.siteBaseUrl} />;
}
```

Available helpers: `loadDdysView`, `loadDdysMovie`, `loadDdysSources`, `loadDdysRequestForm`, and `loadDdysDiagnostics`.

## Actions

```ts
import { createDdysRequestAction } from 'ddys-react-router/actions';

export const action = createDdysRequestAction();
```

For JSON/API style responses use the resource-route action instead.

## Resource Routes

```ts
// app/routes/api.ddys.proxy.ts
export { ddysProxyLoader as loader } from 'ddys-react-router/resource-routes';

// app/routes/api.ddys.request.ts
export { ddysRequestLoader as loader, ddysRequestAction as action } from 'ddys-react-router/resource-routes';

// app/routes/api.ddys.diagnostics.ts
export { ddysDiagnosticsLoader as loader, ddysDiagnosticsAction as action } from 'ddys-react-router/resource-routes';

// app/routes/api.ddys.revalidate.ts
export { ddysRevalidateAction as action } from 'ddys-react-router/resource-routes';
```

`/api/ddys/proxy` validates an allow-list before forwarding. Browser code only talks to local resource routes, so the DDYS API key never enters the browser bundle. `/api/ddys/revalidate` requires `DDYS_REVALIDATE_TOKEN`; without it the resource route returns 403.

## SEO

```ts
export { ddysSitemapLoader as loader } from 'ddys-react-router/resource-routes';
export { ddysRobotsLoader as loader } from 'ddys-react-router/resource-routes';
export { ddysManifestLoader as loader } from 'ddys-react-router/resource-routes';
export { ddysFaviconLoader as loader } from 'ddys-react-router/resource-routes';
```

Programmatic helpers are available from `ddys-react-router/seo`: `createDdysSeo`, `createDdysMovieSeo`, `createDdysMovieJsonLd`, `createDdysMeta`, `createDdysDocumentLinks`, `createDdysSitemap`, `createDdysRobotsText`, `createDdysManifest`, and `createDdysFaviconSvg`.

```tsx
import { createDdysDocumentLinks, createDdysMeta } from 'ddys-react-router/seo';

export const links = () => createDdysDocumentLinks();
export const meta = ({ loaderData }: { loaderData: unknown }) => createDdysMeta(loaderData as any);
```

## Components

```tsx
import { DdysView } from 'ddys-react-router/components';
import { DdysSearch, DdysRequestForm, DdysDiagnostics } from 'ddys-react-router/components/client';
import 'ddys-react-router/styles.css';
```

Components include `DdysCard`, `DdysGrid`, `DdysList`, `DdysMovieDetail`, `DdysSources`, `DdysView`, `DdysSearch`, `DdysRequestForm`, and `DdysDiagnostics`.

## Example

See `examples/react-router-app` for a Framework Mode app with `app/routes.ts`, loaders, actions, resource-routes, sitemap, robots, manifest, favicon, and DDYS pages.

## Static/SPA Notes

Full proxy, diagnostics, request form, revalidate, and server loaders require a React Router server runtime. For SPA-only deployment, use preloaded data or a separately deployed Worker/API proxy.

## Build ZIP

```powershell
powershell -ExecutionPolicy Bypass -File tools/build-package.ps1 -Version 0.1.4
```
