import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';

import { HintLayout, LoadingLayout } from '@common/ui/layouts';
import TranslationsContext from '@common/contexts/translationsContext';
import translationStore from '@common/utils/translations';

const withTranslations = (path, feature = '') => (
  WrappedComponent => (
    function Translations(props) {
      const { locale = 'en-IN' } = props;
      const [loading, setLoading] = useState(false);
      const [translations, setTranslations] = useState(null);
      const [error, setError] = useState(null);
      const translationState = useMemo(() => ({
        translations,
      }), [translations]);

      const fetchTranslations = useCallback(() => {
        translationStore.emit('fetch', { path, locale, feature });
      }, [locale]);

      const _setTranslation = useCallback(
        ({ translations: newTranslations, path: emittedPath }) => {
          if (path === emittedPath) {
            setTranslations(newTranslations);
          }
        }, [setTranslations],
      );

      const _setLoading = useCallback(
        ({ loading: newLoading, path: emittedPath }) => {
          if (path === emittedPath) {
            setLoading(newLoading);
          }
        }, [setLoading],
      );

      const _setError = useCallback(
        ({ error: newError, path: emittedPath }) => {
          if (path === emittedPath) {
            setError(newError);
          }
        }, [setError],
      );

      useEffect(() => {
        translationStore.on('loaded', _setTranslation);
        translationStore.on('loading', _setLoading);
        translationStore.on('error', _setError);

        return () => {
          translationStore.off('loaded', _setTranslation);
          translationStore.off('loading', _setLoading);
          translationStore.off('error', _setError);
        };
      }, [_setTranslation, _setLoading, _setError]);


      useEffect(() => {
        fetchTranslations();
      }, [fetchTranslations]);

      if (loading) {
        return (
          <LoadingLayout
            isFit
          />
        );
      } else if (error) {
        return (
          <HintLayout
            message="Something went wrong! Please try again"
            actionFn={fetchTranslations}
            isFit
          />
        );
      } else {
        return (
          <TranslationsContext.Provider value={translationState}>
            <WrappedComponent
              {...props}
              translations={translations}
            />
          </TranslationsContext.Provider>
        );
      }
    }
  )
);
export default withTranslations;
