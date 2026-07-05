import type { DdysConfigInput } from '../client/config';
import { getDdysConfig } from '../server/config';
import { identityFromRequest, submitDdysRequest } from '../server/request-service';
import { formDataToObject, requestToObject } from '../utils/security';

export interface DdysActionArgs {
  request: Request;
  params?: Record<string, string | undefined>;
  context?: unknown;
}

export interface DdysRequestActionOptions {
  config?: DdysConfigInput;
  identity?: (request: Request) => string;
}

export interface DdysRequestActionResult {
  success: boolean;
  message: string;
  data?: unknown;
  values?: Record<string, unknown>;
}

export function createDdysRequestAction(options: DdysRequestActionOptions = {}) {
  return async function action(args: DdysActionArgs): Promise<DdysRequestActionResult> {
    const config = getDdysConfig(options.config);
    const input = args.request.headers.get('content-type')?.includes('application/json')
      ? await requestToObject(args.request)
      : formDataToObject(await args.request.formData());
    const identity = options.identity?.(args.request) ?? identityFromRequest(args.request);
    try {
      return { success: true, message: 'Request submitted.', data: await submitDdysRequest(config, input, { identity, request: args.request }) };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'DDYS request submission failed.', values: input };
    }
  };
}

export const ddysRequestAction = createDdysRequestAction();
