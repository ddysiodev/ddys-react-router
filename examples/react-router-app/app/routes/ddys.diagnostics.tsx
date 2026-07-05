import { DdysDiagnostics } from 'ddys-react-router/components/client';
import { loadDdysDiagnostics } from 'ddys-react-router/loaders';

export { meta } from '../lib/seo';
export const loader = loadDdysDiagnostics;

export default function Route() {
  return <DdysDiagnostics />;
}
