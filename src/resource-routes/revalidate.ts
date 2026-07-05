import type { DdysConfigInput } from '../client/config';
import { revalidateDdysCache } from '../server/cache';
import { getDdysConfig } from '../server/config';
import type { DdysActionArgs } from '../loaders';

export interface DdysRevalidateResourceOptions {
  config?: DdysConfigInput;
}

export function createDdysRevalidateResourceRoute(options: DdysRevalidateResourceOptions = {}) {
  return async function action(args: DdysActionArgs) {
    const config = getDdysConfig(options.config);
    const input = await args.request.json().catch(() => ({})) as { token?: string; route?: string; tag?: string; path?: string };
    const token = input.token || args.request.headers.get('x-ddys-revalidate-token') || new URL(args.request.url).searchParams.get('token') || '';
    if (!config.revalidateToken) return Response.json({ success: false, message: 'DDYS revalidate token is not configured.' }, { status: 403 });
    if (token !== config.revalidateToken) return Response.json({ success: false, message: 'Invalid DDYS revalidate token.' }, { status: 403 });
    return Response.json(revalidateDdysCache({ route: input.route, tag: input.tag, path: input.path }));
  };
}

export const ddysRevalidateAction = createDdysRevalidateResourceRoute();
