import pick from 'lodash/pick';

const REACT_SPRING_ANIMATION_PROPS = [
  'delay',
  'onRest',
  'config',
  'reset',
  'reverse',
  'loop',
  'immediate',
];

export const pickReactSpringProps = (
  props = {},
) => pick(props, REACT_SPRING_ANIMATION_PROPS);
