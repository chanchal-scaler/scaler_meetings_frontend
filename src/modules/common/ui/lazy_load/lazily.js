
import { lazy } from 'react';

const lazily = (loader) => new Proxy(({}), {
  get: (_, componentName) => lazy(() => loader(componentName).then((x) => ({
    default: (x[componentName]),
  }))),
});

export default lazily;
