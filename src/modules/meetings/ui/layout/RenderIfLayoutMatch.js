import { Observer } from 'mobx-react';
import PropTypes from 'prop-types';

import { isFunction } from '@common/utils/type';
import { LayoutModes } from '~meetings/utils/layout';
import { mobxify } from '~meetings/ui/hoc';

function RenderIfLayoutMatch({
  children,
  layoutStore,
  layoutModes = [LayoutModes.standalone, LayoutModes.widgetLarge],
}) {
  if (layoutModes.includes(layoutStore.mode)) {
    return isFunction(children) ? (
      <Observer>
        {() => children()}
      </Observer>
    ) : children;
  } else {
    return null;
  }
}

RenderIfLayoutMatch.propTypes = {
  layoutModes: PropTypes.array.isRequired,
};

export default mobxify('layoutStore')(RenderIfLayoutMatch);
