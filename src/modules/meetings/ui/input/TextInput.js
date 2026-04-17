import React from 'react';

function TextInput({
  inputChange,
  className,
  value,
}) {
  return (
    <input
      value={value}
      onChange={(e) => inputChange(e.target.value)}
      className={className}
    />
  );
}

export default TextInput;
