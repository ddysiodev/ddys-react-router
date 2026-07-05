import { useLoaderData } from 'react-router';
import { loadDdysView } from 'ddys-react-router/loaders';
import { DdysPage } from '../lib/DdysPage';

export { meta } from '../lib/seo';
export const loader = (args: any) => loadDdysView(args, 'calendar');
export default function Route() { return <DdysPage data={useLoaderData<typeof loader>()} />; }
