import ACTIONS from '~analytics/store/actions';

// Track State
const initialState = {
  last: {},
  history: [],
};

// track reducer
export default function trackReducer(state = initialState, action) {
  const {
    type, event, properties, options, meta,
  } = action;

  switch (type) {
    case ACTIONS.track: {
      const trackEvent = {
        event,
        properties,
        ...(Object.keys(options).length) && { options },
        meta,
      };
      return {
        ...state,
        ...{
          last: trackEvent,
          history: [
            ...state.history,
            trackEvent,
          ],
        },
      };
    }
    default:
      return state;
  }
}
