# DDYS React Router 集成包

[English](README.md)

`ddys-react-router` 是低端影视 API 的官方 React Router Framework Mode 集成包，提供 TypeScript API Client、服务端 loader、action、resource-routes、React 组件、缓存、SEO、诊断和安全求片表单。

## 安装

```bash
npm install ddys-react-router react-router react react-dom
```

React Router 8 要求 React 19。Framework Mode 使用 `@react-router/dev`：

```ts
// vite.config.ts
import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';

export default defineConfig({ plugins: [reactRouter()] });
```

## 环境变量

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

`DDYS_API_KEY`、`DDYS_FORM_SECRET`、`DDYS_REVALIDATE_TOKEN` 必须只在服务端使用，不要暴露为公开环境变量。

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

可用 helper：`loadDdysView`、`loadDdysMovie`、`loadDdysSources`、`loadDdysRequestForm`、`loadDdysDiagnostics`。

## Actions

```ts
import { createDdysRequestAction } from 'ddys-react-router/actions';

export const action = createDdysRequestAction();
```

如果需要 JSON/API 风格响应，可以使用 resource-route action。

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

`/api/ddys/proxy` 会先做 allow-list 校验。浏览器只请求本地 resource route，低端影视 API Key 不会进入浏览器 bundle。`/api/ddys/revalidate` 必须配置 `DDYS_REVALIDATE_TOKEN`，未配置时返回 403。

## SEO

```ts
export { ddysSitemapLoader as loader } from 'ddys-react-router/resource-routes';
export { ddysRobotsLoader as loader } from 'ddys-react-router/resource-routes';
export { ddysManifestLoader as loader } from 'ddys-react-router/resource-routes';
export { ddysFaviconLoader as loader } from 'ddys-react-router/resource-routes';
```

`ddys-react-router/seo` 提供 `createDdysSeo`、`createDdysMovieSeo`、`createDdysMovieJsonLd`、`createDdysSitemap`、`createDdysRobotsText`、`createDdysManifest`。

## 组件

```tsx
import { DdysView } from 'ddys-react-router/components';
import { DdysSearch, DdysRequestForm, DdysDiagnostics } from 'ddys-react-router/components/client';
import 'ddys-react-router/styles.css';
```

组件包括 `DdysCard`、`DdysGrid`、`DdysList`、`DdysMovieDetail`、`DdysSources`、`DdysView`、`DdysSearch`、`DdysRequestForm`、`DdysDiagnostics`。

## 示例

见 `examples/react-router-app`。它是一个 Framework Mode 示例，包含 `app/routes.ts`、loader、action、resource-routes、sitemap、robots、manifest 和 DDYS 页面。

## 静态/SPA 说明

完整 proxy、诊断、求片表单、revalidate 和服务端 loader 都需要 React Router 服务端运行时。如果是纯 SPA 部署，请使用预加载数据，或单独部署 Worker/API proxy。

## 构建 ZIP

```powershell
powershell -ExecutionPolicy Bypass -File tools/build-package.ps1 -Version 0.1.2
```
