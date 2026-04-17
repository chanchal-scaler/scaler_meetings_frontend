import { useIsTouch } from '@common/hooks';
import useControlsFallback from './useControlsFallback';
import useGlobalState from './useGlobalState';

function useBookmarkEnabled() {
  const { isBookmarkEnabled } = useGlobalState();
  const isTouch = useIsTouch();
  const isFallback = useControlsFallback();
  return !isTouch && !isFallback && isBookmarkEnabled;
}

export default useBookmarkEnabled;
