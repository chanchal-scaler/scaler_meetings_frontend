import React from 'react';
import classNames from 'classnames';

import { forwardRef } from '@common/ui/hoc';
import Icon from '@common/ui/general/Icon';

const VECTOR_ICONS_PREFIX = 'v-icon';

function VectorIcon({
  className,
  forwardedRef,
  isBold,
  ...props
}) {
  return (
    <Icon
      ref={forwardedRef}
      className={classNames(
        { 'v-icon-bold-font': isBold },
        { [className]: className },
      )}
      prefix={VECTOR_ICONS_PREFIX}
      {...props}
    />
  );
}

export default forwardRef(VectorIcon);
