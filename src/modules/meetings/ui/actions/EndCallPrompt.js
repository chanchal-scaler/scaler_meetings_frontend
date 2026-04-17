import React, { useCallback } from 'react';

function EndCallPrompt({ setConfirmString }) {
  const handleInputChange = useCallback(e => {
    if (e.target.value !== '') { setConfirmString(e.target.value); }
  }, [setConfirmString]);

  return (
    <div className="meeting-endcall-dialog">
      <div className="meeting-endcall-dialog__label">
        Type
        <span className="bold italic"> confirm </span>
        to end this meeting for all.
      </div>
      <input
        className="meeting-endcall-dialog__input"
        onChange={handleInputChange}
        placeholder="confirm"
      />
      <div className="meeting-endcall-dialog__label">
        <span className="bold">Please Note: </span>
        Proceeding will end this meeting for all!
      </div>
    </div>
  );
}

export default EndCallPrompt;
