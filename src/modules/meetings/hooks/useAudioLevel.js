import { useEffect, useState } from 'react';

import SoundMeter from '@common/lib/soundMeter';

function useAudioLevel(stream) {
  const [level, setLevel] = useState(0);

  useEffect(() => {
    if (stream && SoundMeter.isSupported()) {
      const meter = new SoundMeter();

      meter.on('level-change', () => setLevel(meter.level));
      meter.connectToSource(stream);

      return () => meter.stop();
    }

    return undefined;
  }, [stream]);

  return level;
}

export default useAudioLevel;
