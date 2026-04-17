import React, { createRef } from 'react';

function FileSelect({ onChange, children }) {
  const fileSelector = createRef();
  const handleClick = () => fileSelector.current.click();

  return (
    <span
      className="lecture-notes__file-select cursor"
      onClick={handleClick}
      role="presentation"
    >
      <input
        type="file"
        ref={fileSelector}
        onChange={(event) => onChange(event.target.files)}
        hidden
        multiple
      />
      {children}
    </span>
  );
}

export default FileSelect;
