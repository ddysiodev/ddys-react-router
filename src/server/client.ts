import { DdysClient } from '../client/client';
import type { DdysConfigInput } from '../client/config';
import { getDdysConfig } from './config';

export function createDdysServerClient(config: DdysConfigInput = {}, fetcher: typeof fetch = fetch) {
  return new DdysClient(getDdysConfig(config), fetcher);
}
