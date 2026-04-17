import React, { useContext } from 'react';
import pick from 'lodash/pick';

import { MobxContext } from '~meetings/ui/Provider';

/**
 * Example usage:
 * injectStores('homeStore', 'settingStore')(BaseComponent)
 */
function injectStores(...storesToInject) {
  return (BaseComponent) => {
    function InjectStores(props) {
      const stores = useContext(MobxContext);
      const requiredStores = pick(stores, storesToInject);

      return <BaseComponent {...requiredStores} {...props} />;
    }

    // For easy debugging with react dev tools
    InjectStores.displayName = `InjectStores${BaseComponent.displayName}`;

    return InjectStores;
  };
}

export default injectStores;
