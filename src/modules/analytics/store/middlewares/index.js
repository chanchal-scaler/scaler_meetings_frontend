import thunk from 'redux-thunk';

import generateMeta from '~analytics/utils/middlewares';
import identifyMiddleware from './identify';
import initializeMiddleware from './initialize';
import pluginsMiddleware from './plugins';

const enrichMiddleware = () => next => action => {
  if (!action.meta) {
    // eslint-disable-next-line no-param-reassign
    action.meta = generateMeta();
  }
  return next(action);
};

const middlewares = [
  thunk,
  enrichMiddleware,
  initializeMiddleware,
  identifyMiddleware,
  pluginsMiddleware(),
];

export default middlewares;
