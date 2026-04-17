import { observer } from 'mobx-react';
import compose from 'lodash/fp/compose';

import injectStores from './injectStores';

function mobxify(...stores) {
  return compose(
    injectStores(...stores),
    observer,
  );
}

export default mobxify;
