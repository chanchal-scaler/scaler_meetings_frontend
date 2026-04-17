import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { isFunction } from '@common/utils/type';
import { withBackNavigation } from '@common/ui/hoc';
import Icon from './Icon';
import Tappable from './Tappable';

/**
 * `backTo` is the path to which the back button should take to if there is
 * nothing in history to go back.
 *
 * *Note*: Make sure to add icon font with `arrow-left` icon in it
 */
function BackButton({
  backTo, className, goBack, label, onClick, ...remainingProps
}) {
  const handleOnClick = useCallback(() => {
    if (isFunction(goBack)) {
      goBack();
    }
    if (isFunction(onClick)) {
      onClick();
    }
  }, [goBack, onClick]);

  return (
    <Tappable
      className={classNames(
        'btn btn-light',
        { [className]: className },
      )}
      onClick={handleOnClick}
      {...remainingProps}
    >
      <Icon name="arrow-left" />
      {label && <span className="m-l-5">{label}</span>}
    </Tappable>
  );
}

BackButton.propTypes = {
  backTo: PropTypes.string.isRequired,
  className: PropTypes.string,
  goBack: PropTypes.func.isRequired,
};

export default withBackNavigation(BackButton);
