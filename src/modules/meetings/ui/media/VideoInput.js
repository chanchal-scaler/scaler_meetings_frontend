import React from 'react';
import classNames from 'classnames';

import { Field } from '@common/ui/form';
import { mobxify } from '~meetings/ui/hoc';
import { Select } from '~meetings/ui/general';

function VideoInput({ mediaStore: store, className, showHint = false }) {
  const { videoHardwareError } = store;

  function deviceOptionUi(device, index) {
    return (
      <Select.Option
        key={device.deviceId}
        value={device.deviceId}
      >
        {device.label || `Camera ${index + 1}`}
      </Select.Option>
    );
  }

  function infoUi() {
    if (videoHardwareError) {
      return (
        <div className="h5 danger bold hint m-v-5">
          {videoHardwareError.message || 'Unable to load your camera'}
        </div>
      );
    } else {
      return null;
    }
  }

  return (
    <Field
      className={classNames(
        'video-input m-select-field',
        { [className]: className },
      )}
      formFieldHeaderClassName="m-select-field__field-header"
      labelClassName="m-select-field__field-label"
      label="Choose camera"
    >
      <Select
        name="videoDeviceId"
        onChange={store.setDevice}
        value={store.videoDeviceId}
      >
        {store.videoInputs.map(deviceOptionUi)}
      </Select>
      {showHint && (
        <span className="h5 hint m-v-10">
          (Changes will take effect on reload)
        </span>
      )}
      {infoUi()}
    </Field>
  );
}

export default mobxify('mediaStore', 'meetingStore')(VideoInput);
