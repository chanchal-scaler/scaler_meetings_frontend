import { logEvent } from './logger';

// eslint-disable-next-line import/prefer-default-export
export async function lazyModule(loader) {
  try {
    const module = await loader();
    return module;
  } catch (error) {
    logEvent('error', 'DynamicImportError: Failed to lazy load', error);
    throw error;
  }
}
