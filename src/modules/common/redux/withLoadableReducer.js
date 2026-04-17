import { generateActionCreator, generateActionType } from './utils';

const GET_INIT = 'GET_INIT';
const GET_DONE = 'GET_DONE';
const GET_ERROR = 'GET_ERROR';

const defaultInputReducer = (state = {}) => state;

/**
 * Documentation for below three functions. Creates action creators to handle
 * loading data from server.
 *
 * Example:
 * const loadProblemInit = createGetInitAction('problem');
 *
 * const loadProblemDone = createGetDoneAction('problem');
 *
 * const loadProblemError = createGetErrorAction('problem');
 *
 *
 * function loadProblem(id) {
 *   return async (dispatch) => {
 *     dispatch(loadProblemInit());
 *
 *     try {
 *       const json = await someApiCall();
 *       loadProblemDone(json);
 *     } catch (error) {
 *       loadProblemError(error);
 *     }
 *   }
 * }
 * @param {String} namespace The string with which reducer is namespaced.
 * @returns {Function} The action creator function
 */
export function createGetInitAction(namespace) {
  return generateActionCreator(namespace, GET_INIT);
}

export function createGetDoneAction(namespace) {
  return generateActionCreator(namespace, GET_DONE);
}

export function createGetErrorAction(namespace) {
  return generateActionCreator(namespace, GET_ERROR);
}

/**
 * A higher reducer which composes input reducer with action to fetch some data
 * from server.
 *
 * Example:
 * function problemReducer(state = { bookmarked: false }, action) {
 *   switch (action.type) {
 *     case SET_PROBLEM_BOOKMARK:
 *       return { ...state, bookmarked: true };
 *     default:
 *       return state;
 *   }
 * }
 *
 * export default withLoadableReducer('problem')(problemReducer);
 *
 * @param {string} namespace The string with which reducer has to be namespaced.
 * @param {Object} [options] Additional options
 * @param {String} [options.dataKey="data"] The key in state which stores the
 * data.
 * @returns {Function} A function with a reducers as input and returns the
 * composed reducer function.
 */
function withLoadableReducer(namespace, options = {
  dataKey: 'data',
}) {
  return function (inputReducer = defaultInputReducer) {
    return function (state, action) {
      switch (action.type) {
        case generateActionType(namespace, GET_INIT):
          return {
            ...state,
            isLoading: true,
            loadError: null,
            isLoaded: false,
          };
        case generateActionType(namespace, GET_DONE):
          return {
            ...state,
            isLoading: false,
            isLoaded: true,
            [options.dataKey]: action.payload,
          };
        case generateActionType(namespace, GET_ERROR):
          return {
            ...state,
            isLoading: false,
            loadError: action.payload,
            isLoaded: false,
          };
        default:
          return inputReducer(state, action);
      }
    };
  };
}

export default withLoadableReducer;
