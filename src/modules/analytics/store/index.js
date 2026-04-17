import {
  applyMiddleware, combineReducers, createStore, compose,
} from 'redux';

import {
  contextReducer,
  pageReducer,
  pluginsReducer,
  queueReducer,
  trackReducer,
  userReducer,
} from './reducers';
import { ensureArray } from '@common/utils/array';
import generateMeta from '~analytics/utils/middlewares';
import middlewares from './middlewares';

const reducers = combineReducers({
  context: contextReducer,
  page: pageReducer,
  plugins: pluginsReducer,
  queue: queueReducer,
  track: trackReducer,
  user: userReducer,
});

const composeEnhancers = typeof window === 'object'
  && window.ENV_VARS.mode === 'development'
  && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
  }) : compose;

const enhancer = composeEnhancers(
  applyMiddleware(...middlewares),
);

const store = createStore(reducers, enhancer);

/* Supe up dispatch with callback promise resolver. Happens in enrichMeta */
function enhanceDispatch(fn) {
  return function (event, resolver, callbacks) {
    const meta = generateMeta(event.meta, resolver, ensureArray(callbacks));
    const newEvent = { ...event, ...{ meta } };
    return fn(newEvent);
  };
}

// Automatically apply meta to dispatch calls
store.dispatch = enhanceDispatch(store.dispatch);

export default store;
