import mixpanel from 'mixpanel-browser';

import { isDevelopment } from '@common/utils/debug';
import { getMixPanelToken } from '~analytics/utils/constants';
import { PLUGINS } from '~analytics/utils/plugins';
import Plugin from '~analytics/models/plugin';

const PAGE_TRACK_EVENT = 'Page View';

/**
 * Mixpanel Analytics plugin
 * @link https://getanalytics.io/plugins/mixpanel/
 * @param {object} pluginConfig - Plugin settings
 * @param {string} pluginConfig.token
 * - The mixpanel token associated to a mixpanel project
 * @param {object} [pluginConfig.options]
 * - The mixpanel init options
 * @param {string} [pluginConfig.pageEvent]
 * - Event name to use for page() events (default to page path)
 * @return {object} Analytics plugin
 * @example
 *
 * mixpanelPlugin = new MixpanelPlugin({
 *   token: 'sunnyscaler123'
 * })
 */
class MixpanelPlugin extends Plugin {
  constructor(config = {}) {
    super({
      name: PLUGINS.mixpanel,
      config: {
        token: getMixPanelToken(),
        ...config,
      },
    });
  }

  initialize() {
    mixpanel.init(this.config.token, {
      batch_requests: true,
      debug: isDevelopment(),
      ...this.config,
    });
    this.loaded = true;
  }

  // eslint-disable-next-line class-methods-use-this
  track({ payload }) {
    mixpanel.track(payload.event, payload.properties);
  }

  /**
   * Mixpanel doesn't have a "page" function,
   * so we are using the track method by sending
   * the path as tracked event and search parameters as properties
   */
  page({ payload }) {
    mixpanel.track(
      this.config.pageEvent || PAGE_TRACK_EVENT,
      payload.properties,
    );
  }

  /**
   * Identify a visitor in mixpanel
   *
   * Mixpanel doesn't allow to set properties directly in identify,
   * so mixpanel.people.set is also called if properties are passed
   *
   * superProperties are properties that needs to be sent with every event
   */
  // eslint-disable-next-line class-methods-use-this
  identify({ payload }) {
    const { userId, traits } = payload;
    const { superProperties } = traits;
    if (userId) {
      mixpanel.identify(userId);
    }
    if (superProperties) {
      mixpanel.register(superProperties);
      delete traits.superProperties;
    }
    if (traits) {
      mixpanel.people.set(traits);
    }
  }

  /**
   * The alias method creates an alias which Mixpanel
   * will use to remap one id to another.
   * Multiple aliases can point to the same identifier.
   *
   * @param  {string} [alias]
   * - A unique identifier that you want to use for this user in the future.
   * @param  {string} [original]
   * - The current identifier being used for this user.
   */
  // eslint-disable-next-line class-methods-use-this
  alias(alias, original) {
    mixpanel.alias(alias, original);
  }

  /*
    Clears super properties and generates a
    new random distinct_id for this instance.
    Useful for clearing data when a user logs out.
  */
  // eslint-disable-next-line class-methods-use-this
  reset() {
    mixpanel.reset();
  }
}

export default MixpanelPlugin;
