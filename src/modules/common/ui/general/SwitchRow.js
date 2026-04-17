import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { HelperText, Label } from '@common/ui/form';
import Switch from './Switch';

function SwitchRow({
  className,
  inputClassName,
  hint,
  label,
  ...remainingProps
}) {
  return (
    <label
      className={classNames(
        'switch-row',
        { [className]: className },
      )}
    >
      <div className="switch-row__content">
        <Label>
          {label}
        </Label>
        {hint && (
          <HelperText>
            {hint}
          </HelperText>
        )}
      </div>
      <div className="switch-row__control">
        <Switch
          className={inputClassName}
          {...remainingProps}
        />
      </div>
    </label>
  );
}

SwitchRow.propTypes = {
  className: PropTypes.string,
  inputClassName: PropTypes.string,
  hint: PropTypes.node,
  label: PropTypes.node.isRequired,
};

export default SwitchRow;
