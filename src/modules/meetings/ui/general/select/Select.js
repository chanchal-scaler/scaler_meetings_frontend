import React, {
  Children, cloneElement, useCallback, useEffect, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { calculateAvailableSpace, remToPixels } from '@common/utils/dom';
import { Dropdown, DropdownItem, Icon } from '@common/ui/general';

const arrowIconMap = {
  bottom: 'chevron-down',
  top: 'chevron-down',
};

const popoverLocationMap = {
  bottom: {
    right: 0,
    top: '110%',
  },
  top: {
    right: 0,
    bottom: '110%',
  },
};

const inversePlacementMap = {
  top: 'bottom',
  bottom: 'top',
};

const POPOVER_HEIGHT = 20; // In rem

/**
 * A select component made using dropdown component. Not generalizing this
 * has this is not standard approach for creating as select component can
 * does not have all the features a generic select component should have.
 */
function Select({
  adaptivePlacement,
  children,
  className,
  name,
  noOptionsMessage = 'No options',
  onChange,
  optionsPlacement = 'bottom',
  placeholder = 'Select an option',
  popoverProps = {},
  small = false,
  value,
  ...remainingProps
}) {
  const ref = useRef();

  const [inputWidth, setInputWidth] = useState('none');
  const [isOpen, setOpen] = useState(false);
  const {
    className: popoverClassName,
    ...remainingPopoverProps
  } = popoverProps;

  useEffect(() => {
    if (ref.current) {
      setInputWidth(ref.current.offsetWidth);
    }
  }, [value]);

  const hasSpaceForPopover = useCallback(() => {
    if (ref.current && adaptivePlacement) {
      const availableSpace = calculateAvailableSpace(
        ref.current,
        optionsPlacement,
      );
      return availableSpace > remToPixels(POPOVER_HEIGHT);
    }

    return true;
  }, [adaptivePlacement, optionsPlacement]);

  const handleChange = useCallback(selectedValue => {
    const event = { target: { name, value: selectedValue } };
    onChange(event);
  }, [name, onChange]);

  function optionUi(child) {
    const isSelected = child.props.value === value;
    const propsToInject = { isSelected, small };

    return (
      <DropdownItem
        className="m-select__option"
        component="a"
        onClick={() => handleChange(child.props.value)}
      >
        {cloneElement(child, propsToInject)}
      </DropdownItem>
    );
  }

  function placeholderUi() {
    return (
      <div className="m-select__placeholder">
        {placeholder}
      </div>
    );
  }

  function valueUi() {
    const selectedChild = Children.toArray(children).find(
      child => child.props.value === value,
    );

    return (
      <div
        className={classNames(
          'm-select__title',
          { 'm-select__title--small': small },
          { 'm-select__title--open': isOpen },
        )}
      >
        <div className="m-select__value">
          {selectedChild || placeholderUi()}
        </div>
        <div className="m-select__arrow">
          <Icon name={arrowIconMap[optionsPlacement]} />
        </div>
      </div>
    );
  }

  function optionsUi() {
    if (Children.count(children) === 0) {
      return (
        <div className="m-select__empty">
          {noOptionsMessage}
        </div>
      );
    } else {
      return Children.map(children, optionUi);
    }
  }

  const finalPlacement = hasSpaceForPopover()
    ? optionsPlacement
    : inversePlacementMap[optionsPlacement];
  return (
    <Dropdown
      ref={ref}
      className={classNames(
        'm-select',
        { [className]: className },
      )}
      component="a"
      isOpen={isOpen}
      onChange={setOpen}
      title={valueUi}
      titleClassName="m-select__input"
      popoverProps={{
        className: classNames(
          'm-select__popover scroll',
          { [popoverClassName]: popoverClassName },
        ),
        extraScope: 'meeting-app',
        location: popoverLocationMap[finalPlacement],
        style: { minWidth: inputWidth },
        ...remainingPopoverProps,
      }}
      {...remainingProps}
    >
      {optionsUi()}
    </Dropdown>
  );
}

Select.propTypes = {
  adaptivePlacement: PropTypes.bool,
  noOptionsMessage: PropTypes.node.isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  optionsPlacement: PropTypes.oneOf(Object.keys(arrowIconMap)).isRequired,
  placeholder: PropTypes.node.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]).isRequired,
};

export default Select;
