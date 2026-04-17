import ACTIONS from '~analytics/store/actions';

const initialState = {
  last: {},
  history: [],
};

// page reducer
export default function pageReducer(state = initialState, action) {
  const { properties, options, meta } = action;
  switch (action.type) {
    case ACTIONS.page: {
      const viewData = {
        properties,
        meta,
        ...(Object.keys(options).length) && { options },
      };
      return {
        ...state,
        ...{
          last: viewData,
          history: [
            ...state.history,
            viewData,
          ],
        },
      };
    }
    default:
      return state;
  }
}
