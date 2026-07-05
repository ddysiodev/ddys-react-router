import { useLoaderData } from 'react-router';
import { loadDdysSources } from 'ddys-react-router/loaders';
import { DdysView } from 'ddys-react-router/components';

export { meta } from '../lib/seo';
export const loader = loadDdysSources;
export default function Route() {
  const data = useLoaderData<typeof loader>();
  return <DdysView view="sources" sources={data.sources} siteBaseUrl={data.config.siteBaseUrl} />;
}
