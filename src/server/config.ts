import { configFromEnv, safeDdysConfig, type DdysConfig, type DdysConfigInput } from '../client/config';

let overrideOptions: DdysConfigInput = {};

export function setDdysReactRouterOptions(options: DdysConfigInput = {}) {
  overrideOptions = options;
}

export function getDdysConfig(input: DdysConfigInput = {}): DdysConfig {
  return configFromEnv({
    ...overrideOptions,
    ...input,
    cache: { ...overrideOptions.cache, ...input.cache },
    proxy: { ...overrideOptions.proxy, ...input.proxy },
    requestForm: { ...overrideOptions.requestForm, ...input.requestForm },
    diagnostics: { ...overrideOptions.diagnostics, ...input.diagnostics },
    security: { ...overrideOptions.security, ...input.security },
    reactRouter: { ...overrideOptions.reactRouter, ...input.reactRouter }
  });
}

export function getDdysConfigFromEnv(input: DdysConfigInput = {}): DdysConfig {
  return getDdysConfig(input);
}

export function requireDdysApiKey(config: DdysConfig): void {
  if (!config.apiKey) throw new Error('DDYS_API_KEY is required for authenticated DDYS server calls.');
}

export { safeDdysConfig };
