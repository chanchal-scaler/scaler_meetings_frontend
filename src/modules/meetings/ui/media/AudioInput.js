import React, { useEffect, useState } from 'react';

import { Field } from '@common/ui/form';
import { mobxify } from '~meetings/ui/hoc';
import { Select } from '~meetings/ui/general';
import AudioLevel from './AudioLevel';
import SoundMeter from '@common/lib/soundMeter';

function AudioInput({ mediaStore: store, showHint = false }) {
  const { audioHardwareError } = store;
  const [stream, setStream] = useState(null);

  // Effect that attaches sound meter
  useEffect(() => {
    async function loadStream(constraints) {
      try {
        const mediaStream = await navigator.mediaDevices
          .getUserMedia({ audio: constraints });

        setStream(mediaStream);
      } catch (error) {
        setStream(null);
      }
    }

    if (SoundMeter.isSupported() && store.hasAudioPermissions) {
      loadStream(store.audioConstraints);
      return () => setStream(null);
    }

    return undefined;
  }, [store.audioConstraints, store.hasAudioPermissions]);

  useEffect(() => () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  }, [stream]);


  function deviceOptionUi(device, index) {
    return (
      <Select.Option
        key={device.deviceId}
        value={device.deviceId}
      >
        {device.label || `Microphone ${index + 1}`}
      </Select.Option>
    );
  }

  const infoUi = () => {
    if (audioHardwareError) {
      return (
        <div className="h5 danger bold m-v-5">
          {audioHardwareError.message || 'Unable to load your microphone'}
        </div>
      );
    } else {
      return null;
    }
  };

  return (
    <Field
      label="Choose microphone"
      className="m-select-field"
      formFieldHeaderClassName="m-select-field__field-header"
      labelClassName="m-select-field__field-label"
    >
      <Select
        name="audioDeviceId"
        onChange={store.setDevice}
        value={store.audioDeviceId}
      >
        {store.audioInputs.map(deviceOptionUi)}
      </Select>
      {showHint && (
        <span className="h5 hint m-v-10">
          (Changes will take effect on reload)
        </span>
      )}
      <AudioLevel className="m-t-10" stream={stream} />
      {infoUi()}
    </Field>
  );
}

export default mobxify('mediaStore', 'meetingStore')(AudioInput);
