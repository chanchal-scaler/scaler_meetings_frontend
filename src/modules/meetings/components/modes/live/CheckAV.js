import React from 'react';

import { Icon, Tappable } from '@common/ui/general';

export default function CheckAV({ onClick }) {
  return (
    <div className="m-login__check-av h5">
      <div className="default">
        <span className="dark bold m-r-5">Camera/microphone</span>
        not working?
      </div>
      <Tappable
        className="btn btn-outlined btn-small btn-primary"
        onClick={onClick}
      >
        <Icon name="list" className="m-r-5" />
        Check your audio and video
      </Tappable>
    </div>
  );
}
