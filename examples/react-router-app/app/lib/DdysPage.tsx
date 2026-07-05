import { DdysView } from 'ddys-react-router/components';

export function DdysPage({ data }: { data: any }) {
  return <DdysView view={data.view} payload={data.payload} movie={data.movie} sources={data.sources} siteBaseUrl={data.config?.siteBaseUrl} />;
}
