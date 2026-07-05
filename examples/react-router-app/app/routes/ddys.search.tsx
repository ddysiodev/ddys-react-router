import { useLoaderData } from 'react-router';
import { loadDdysView } from 'ddys-react-router/loaders';
import { DdysSearch } from 'ddys-react-router/components/client';
import { DdysPage } from '../lib/DdysPage';

export const loader = (args: any) => loadDdysView(args, 'search', { params: { q: new URL(args.request.url).searchParams.get('q') || 'movie', per_page: 12 } });
export default function Route() {
  const data = useLoaderData<typeof loader>();
  return <><DdysSearch /><DdysPage data={data} /></>;
}
