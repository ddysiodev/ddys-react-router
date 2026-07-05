import { useLoaderData } from 'react-router';
import { loadDdysRequestForm } from 'ddys-react-router/loaders';
import { DdysRequestForm } from 'ddys-react-router/components/client';

export const loader = loadDdysRequestForm;
export default function Route() {
  const data = useLoaderData<typeof loader>();
  return <DdysRequestForm token={data.token} honeypotField={data.config.requestForm.honeypotField} />;
}
