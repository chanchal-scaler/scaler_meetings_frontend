import { isFunction } from '@common/utils/type';

// Stack to temporarily hold deferred promises/callbacks
const stack = {};

function runCallback(id, payload) {
  if (stack[id] && isFunction(stack[id])) {
    stack[id](payload);
    delete stack[id];
  }
}

export { stack, runCallback };
