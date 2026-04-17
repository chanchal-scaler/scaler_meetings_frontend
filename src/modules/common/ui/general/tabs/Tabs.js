/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { isFunction } from '@common/utils/type';

function Tabs({
  activeTabName,
  activeTabClassName,
  children: _children,
  className,
  defaultTabName,
  disabledTabClassName,
  headerClassName,
  onChange,
  tabClassName,
  tabBody,
  ...remainingProps
}) {
  const children = React.Children.toArray(_children).filter(o => Boolean(o));

  const [_activeTabName, setActiveTabName] = useState(
    defaultTabName || activeTabName || children[0].tabName
    || children[0].props.tabName,
  );

  useEffect(() => {
    setActiveTabName(prevTabName => {
      if (activeTabName && prevTabName !== activeTabName) {
        return activeTabName;
      }

      return prevTabName;
    });
  }, [activeTabName]);

  const handleChange = useCallback((tabName, disabled, tabIndex) => {
    if (disabled) {
      return;
    }
    setActiveTabName(tabName);

    if (isFunction(onChange)) {
      onChange(tabName, tabIndex);
    }
  }, [onChange]);

  return (
    <div
      className={classNames(
        'tabs',
        { [className]: className },
      )}
      {...remainingProps}
    >
      <div
        className={classNames(
          'tabs__header',
          { [headerClassName]: headerClassName },
        )}
      >
        {
          children.map((child, tabIndex) => {
            const { tabName, disabled } = child.props;
            const isActive = tabName === _activeTabName;
            return (
              <div
                key={child.props.tabName}
                className={classNames(
                  'tabs__tab',
                  { [tabClassName]: tabClassName },
                  { 'tabs__tab--active': isActive },
                  { [activeTabClassName]: isActive && activeTabClassName },
                  { 'tabs__tab--disabled': disabled },
                  { [disabledTabClassName]: disabledTabClassName && disabled },
                  { 'tabs__tab--right-aligned': child.props.isRightAligned },
                )}
                onClick={() => handleChange(tabName, disabled, tabIndex)}
              >
                {
                  isFunction(child.props.title)
                    ? child.props.title({ isActive })
                    : child.props.title
                }
              </div>
            );
          })
        }
      </div>
      {tabBody}
      {
        children.map((child) => {
          if (child.props.tabName === _activeTabName) { return child; }
          return null;
        })
      }
    </div>
  );
}

Tabs.propTypes = {
  defaultTabName: PropTypes.string,
  headerClassName: PropTypes.string,
  activeTabClassName: PropTypes.string,
  disabledTabClassName: PropTypes.string,
  tabClassName: PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default Tabs;
