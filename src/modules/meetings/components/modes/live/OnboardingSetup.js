import React, { useCallback, useEffect } from 'react';
import compose from 'lodash/fp/compose';
import classNames from 'classnames';

import {
  AudioInput, AudioOutput, VideoInput,
} from '~meetings/ui/media';
import { mobxify, withPermissions } from '~meetings/ui/hoc';
import { Tappable } from '@common/ui/general';

function OnboardingSetup({ mediaStore, className, btnClassName }) {
  useEffect(() => {
    mediaStore.loadDevices();
  }, [mediaStore]);

  const handleClick = useCallback(() => {
    mediaStore.setOnboardingRequired(false);
  }, [mediaStore]);

  return (
    <div className={classNames({ [className]: className })}>
      <VideoInput />
      <AudioInput />
      <AudioOutput />
      <Tappable
        className={classNames(
          'btn btn-success bold full-width',
          { [btnClassName]: btnClassName },
        )}
        data-cy="meetings-test-setup-next-button"
        onClick={handleClick}
      >
        Next
      </Tappable>
    </div>
  );
}

const hoc = compose(
  withPermissions,
  mobxify('mediaStore'),
);

export default hoc(OnboardingSetup);
