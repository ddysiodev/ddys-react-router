import type { DdysConfigInput } from '../client/config';
import { getDdysConfig } from '../server/config';
import { createRequestFormToken, identityFromRequest, submitDdysRequest } from '../server/request-service';
import { requestToObject } from '../utils/security';
import type { DdysActionArgs, DdysRouteArgs } from '../loaders';

export interface DdysRequestResourceOptions {
  config?: DdysConfigInput;
  identity?: (request: Request) => string;
}

export function createDdysRequestGetResourceRoute(options: DdysRequestResourceOptions = {}) {
  return async function loader(args: DdysRouteArgs) {
    const config = getDdysConfig(options.config);
    const identity = options.identity?.(args.request) ?? identityFromRequest(args.request);
    try {
      const token = await createRequestFormToken(config, identity);
      return Response.json({ success: true, data: { enabled: config.requestForm.enabled, token, honeypotField: config.requestForm.honeypotField } });
    } catch (error) {
      return Response.json({ success: false, message: error instanceof Error ? error.message : 'DDYS request token failed.' }, { status: 500 });
    }
  };
}

export function createDdysRequestPostResourceRoute(options: DdysRequestResourceOptions = {}) {
  return async function action(args: DdysActionArgs) {
    const config = getDdysConfig(options.config);
    const input = await requestToObject(args.request);
    const identity = options.identity?.(args.request) ?? identityFromRequest(args.request);
    try {
      return Response.json({ success: true, data: await submitDdysRequest(config, input, { identity, request: args.request }) });
    } catch (error) {
      return Response.json({ success: false, message: error instanceof Error ? error.message : 'DDYS request submission failed.', values: input }, { status: statusFor(error) });
    }
  };
}

export const ddysRequestLoader = createDdysRequestGetResourceRoute();
export const ddysRequestAction = createDdysRequestPostResourceRoute();

function statusFor(error: unknown): number {
  if (!(error instanceof Error)) return 500;
  if (/disabled|secret|key/i.test(error.message)) return 403;
  if (/wait|limit|too many/i.test(error.message)) return 429;
  if (/token|invalid|title|year|spam/i.test(error.message)) return 400;
  return 500;
}
