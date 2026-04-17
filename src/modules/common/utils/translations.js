import { apiRequest } from '@common/api/utils';
import { trackGAEvent } from '@common/utils/ga';
import CaseUtil from '@common/lib/caseUtil';
import EventEmitter from '@common/lib/eventEmitter';

const TRANSLATION_GA_EVENT_CATEGORY = 'scaler-translations-failure';
const translationStore = new EventEmitter();
const loading = {};
const translations = {};
const error = {};

translationStore.on('fetch', async ({ path, locale, feature = '' }) => {
  // do not refetch if the child component
  // is already fetching the traslations
  if (loading[path]) {
    translationStore.emit('loading', {
      loading: loading[path],
      path,
    });
    return;
  }

  if (translations[path]) {
    translationStore.emit('loaded', {
      translations: translations[path],
      path,
    });
    return;
  }

  try {
    error[path] = undefined;
    loading[path] = true;
    translationStore.emit('loading', {
      loading: loading[path],
      path,
    });

    const json = await apiRequest('GET', '/translation/',
      null,
      {
        params: {
          path,
          locale,
          feature,
        },
      });

    translations[path] = CaseUtil.toCase('camelCase', json.data);
    translationStore.emit('loaded', {
      translations: translations[path],
      path,
    });
  } catch (e) {
    error[path] = e;
    translationStore.emit('error', {
      error: error[path],
      path,
    });
    trackGAEvent({
      category: TRANSLATION_GA_EVENT_CATEGORY,
      action: 'error',
      label: e?.message,
    });
  }
  loading[path] = false;
  translationStore.emit('loading', {
    loading: loading[path],
    path,
  });
});

export default translationStore;
