import {
  TOUCH_DEVICES_USE_NATIVE_CONTROLS,
} from '~video_player/utils/constants';
import { useIsTouch } from '@common/hooks';

function useControlsFallback() {
  const isTouch = useIsTouch();
  const isTouchDisabled = isTouch && TOUCH_DEVICES_USE_NATIVE_CONTROLS;

  return isTouchDisabled;
}

export default useControlsFallback;
