import React from 'react';

import { Field } from '@common/ui/form';
import { isSpeakerChangeSupported } from '~meetings/utils/media';
import { mobxify } from '~meetings/ui/hoc';
import { Select } from '~meetings/ui/general';

function AudioOutput({ mediaStore: store }) {
  function deviceOptionUi(device, index) {
    return (
      <Select.Option
        key={device.deviceId}
        value={device.deviceId}
      >
        {device.label || `Speaker ${index + 1}`}
      </Select.Option>
    );
  }

  if (isSpeakerChangeSupported()) {
    return (
      <Field
        label="Choose speaker"
        className="m-select-field"
        formFieldHeaderClassName="m-select-field__field-header"
        labelClassName="m-select-field__field-label"
      >
        <Select
          name="speakerDeviceId"
          onChange={store.setDevice}
          value={store.speakerDeviceId}
        >
          {store.audioOutputs.map(deviceOptionUi)}
        </Select>
      </Field>
    );
  } else {
    return null;
  }
}

export default mobxify('mediaStore', 'meetingStore')(AudioOutput);
