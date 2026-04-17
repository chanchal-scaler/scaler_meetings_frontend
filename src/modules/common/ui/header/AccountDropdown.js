import React, { useState } from 'react';
import { Dropdown, Icon } from '@common/ui/general';

function AccountDropdown({
  accountName,
  children,
  className,
  popoverProps = {},
  onChangeCallback = () => {},
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleChange = (isOpen) => {
    setIsDropdownOpen(isOpen);
    onChangeCallback?.(isOpen);
  };

  function _dropdownTitle({ isOpen }) {
    return (
      <>
        <span>{accountName}</span>
        <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} />
      </>
    );
  }
  return (
    <Dropdown
      isOpen={isDropdownOpen}
      className={className}
      title={_dropdownTitle}
      titleClassName="no-highlight"
      popoverProps={{
        className: 'sr-header__dropdown-popover',
        location: { left: 0, top: '100%' },
        ...popoverProps,
      }}
      onClick={() => window.trackGaEvent(
        'mentee-home', 'header-account-dropdown', 'click',
      )}
      onChange={handleChange}
      gtmEventType="account_dropdown"
      gtmEventAction="click"
    >
      {children}
    </Dropdown>
  );
}

export default AccountDropdown;
