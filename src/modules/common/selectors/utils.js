import { createSelector } from 'reselect';

export function createLoaderSelector(baseSelector) {
  const baseLoadingSelector = (state) => baseSelector(state).isLoading;
  const baseErrorSelector = (state) => baseSelector(state).loadError;
  const baseLoadedSelector = (state) => baseSelector(state).isLoaded;

  return createSelector(
    baseLoadingSelector,
    baseErrorSelector,
    baseLoadedSelector,
    (isLoading, loadError, isLoaded) => ({ isLoading, loadError, isLoaded }),
  );
}
