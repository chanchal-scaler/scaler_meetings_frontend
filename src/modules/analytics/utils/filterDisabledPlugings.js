import { isBoolean } from '@common/utils/type';

export default function fitlerDisabledPlugins(
  allPlugins,
  options = {},
) {
  return Object.keys(allPlugins).filter((name) => {
    const fromCallOptions = options.plugins || {};
    // If enabled/disabled by options. Override settings
    if (isBoolean(fromCallOptions[name])) {
      return fromCallOptions[name];
    }
    // If all: false disable everything unless true explicitly set
    if (fromCallOptions.all === false) {
      return false;
    }
    // else use state.plugin settings
    if (allPlugins[name] && allPlugins[name].enabled === false) {
      return false;
    }
    return true;
  }).map((name) => allPlugins[name]);
}
