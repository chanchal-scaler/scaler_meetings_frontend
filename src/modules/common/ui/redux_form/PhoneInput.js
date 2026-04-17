import React, { useEffect, useState } from 'react';
import classNames from 'classnames';

import { list } from '@common/utils/countries';
import { Select } from '@common/ui/form';

const options = list.map(({ code, dialCode, locale }) => (
  { key: code, value: dialCode, locale }
));

function PhoneInput({
  className,
  name,
  value,
  onChange,
  disabled,
  ...remainingProps
}) {
  function getCountryOption(country) {
    return options.find(item => item.key === country);
  }

  function parsePhoneNumber(phone) {
    const [dialCode = '', numberInput = ''] = phone.split('-');
    let countryCode = 'IN';
    if (dialCode) {
      const countryItem = options.find(o => o.value === dialCode);
      if (countryItem) countryCode = countryItem.key;
    }

    return {
      country: countryCode,
      number: numberInput,
    };
  }

  const [country, setCountry] = useState(parsePhoneNumber(value).country);
  const [number, setNumber] = useState(parsePhoneNumber(value).number);

  useEffect(() => {
    if (value) {
      setCountry(parsePhoneNumber(value).country);
      setNumber(parsePhoneNumber(value).number);
    }
  }, [value]);

  useEffect(() => {
    function createEvent() {
      const dialCode = options.find(o => o.key === country).value;
      const target = { value: `${dialCode}-${number}` };

      // eslint-disable-next-line
      onChange && onChange({ target: target });
    }

    createEvent();
  }, [country, number, onChange]);

  const handleCountryChange = (event) => {
    setCountry(event.target.value.key);
  };

  const handleNumberChange = (event) => {
    setNumber(event.target.value);
  };

  function countriesUi() {
    return (
      <Select
        name={name}
        onChange={handleCountryChange}
        value={[getCountryOption(country)]}
        options={options}
        isSearchable
        placeholder="Select code"
        classNamePrefix="phone-input"
        isDisabled={disabled}
      />
    );
  }

  function numberUi() {
    return (
      <input
        onChange={handleNumberChange}
        placeholder="Enter your contact number"
        type="tel"
        value={number}
        disabled={disabled}
        {...remainingProps}
      />
    );
  }

  return (
    <>
      <div
        className={classNames(
          'phone-input',
          { [className]: className },
        )}
      >
        {countriesUi()}
        {numberUi()}
      </div>
    </>
  );
}

export default PhoneInput;
