import { isScaler } from './environment';

const HIT_TYPES = {
  event: 'event',
  timing: 'timing',
};

const DEFAULT_HIT_TYPE = HIT_TYPES.event;
/**
 *
 * @param {String} hitType - required
 * @param {String} category - required
 * @param {String} action - required
 * @param {String} label - not-required
 * @param {Int} value - not-required
 */
export function trackGAEvent({
  hitType = DEFAULT_HIT_TYPE,
  category,
  action,
  label,
  value,
  timingVar,
}) {
  if (window.ga) {
    const gaSendMethod = isScaler() ? 'gtm1.send' : 'send';
    if (hitType === HIT_TYPES.timing) {
      window.ga(gaSendMethod, hitType, category, timingVar, value, label);
    } else {
      window.ga(gaSendMethod, hitType, category, action, label, value);
    }
  }
}
