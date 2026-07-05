import { createDdysMeta } from 'ddys-react-router/seo';

export function meta({ loaderData }: { loaderData?: unknown }) {
  return createDdysMeta(loaderData as any);
}
