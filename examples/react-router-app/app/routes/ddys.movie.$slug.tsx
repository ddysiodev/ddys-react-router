import { useLoaderData } from 'react-router';
import { loadDdysMovie } from 'ddys-react-router/loaders';
import { DdysView } from 'ddys-react-router/components';

export const loader = loadDdysMovie;
export default function Route() {
  const data = useLoaderData<typeof loader>();
  return <DdysView view="movie" movie={data.movie} siteBaseUrl={data.config.siteBaseUrl} />;
}
