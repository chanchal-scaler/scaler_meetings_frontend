import React from 'react';

function NumberInput({
  inputChange,
  className,
  value,
  maxLength,
  placeholder,
}) {
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      maxLength={maxLength}
      onChange={(e) => {
        const formattedValue = e.target.value
          .replace(/[^0-9.]/g, '')
          .replace(/(\..*?)\..*/g, '$1')
          .replace(/^0[^.]/, '0');
        inputChange(formattedValue);
      }}
      className={className}
    />
  );
}

export default NumberInput;
