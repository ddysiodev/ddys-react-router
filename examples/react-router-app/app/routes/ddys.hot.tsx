import { useLoaderData } from 'react-router';
import { loadDdysView } from 'ddys-react-router/loaders';
import { DdysPage } from '../lib/DdysPage';

export const loader = (args: any) => loadDdysView(args, 'hot', { params: { limit: 24 } });
export default function Route() { return <DdysPage data={useLoaderData<typeof loader>()} />; }
