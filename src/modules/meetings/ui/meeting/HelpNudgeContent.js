import React from 'react';

export default function HelpNudgeContent() {
  return (
    <div className="flex col">
      <div className="flex row align-c h4 bold m-b-10">
        <span className="m-r-5">
          We've got you covered!
        </span>
        <span aria-hidden="true">🦸‍♂️</span>
      </div>
      <div className="hint h5">
        If you are facing any technical issues,
        please check the help section for solving your issue
      </div>
    </div>
  );
}
