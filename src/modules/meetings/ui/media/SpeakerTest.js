import React, { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';

import { Field } from '@common/ui/form';
import { Icon } from '@common/ui/general';
import AudioFile from '@common/audio/notifications/ponderous.ogg';

const audioFile = new Audio(AudioFile);

const MAX_AUDIO_PLAY_COUNT = 3;

function SpeakerTest() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayed, setIsPlayed] = useState(false);
  const [userResponse, setUserResponse] = useState('');
  const [audioPlayCount, setAudioPlayCount] = useState(0);

  const playAudio = useCallback(() => {
    audioFile.play();
    audioFile.onended = () => {
      setAudioPlayCount(audioPlayCount + 1);
    };
  }, [audioPlayCount]);

  useEffect(() => {
    if (audioPlayCount < MAX_AUDIO_PLAY_COUNT && isPlaying) {
      playAudio();
    }

    if (audioPlayCount >= MAX_AUDIO_PLAY_COUNT) {
      setIsPlaying(false);
    }
  }, [playAudio, audioPlayCount, isPlaying]);

  const startPlay = useCallback(() => {
    setAudioPlayCount(0);
    setIsPlaying(true);
    setIsPlayed(true);
    setUserResponse('');
    playAudio();
  }, [playAudio]);

  const getUserResponse = useCallback((val) => {
    setIsPlaying(false);
    setIsPlayed(false);
    setUserResponse(val);
  }, []);

  return (
    <Field label="Test speakers">
      <div
        className="speaker-test__play-ringtone h6 no-mgn-b space-between dark"
      >
        <div className="speaker-test__play-ringtone-info h5 no-mgn-b align-c">
          <Icon name="volume-medium" />
          <div>Play Ringtone</div>
        </div>
        {
          !isPlaying ? (
            <div
              role="button"
              onClick={startPlay}
              className="bold primary cursor"
              tabIndex={0}
            >
              Click Here
            </div>
          ) : (
            <div
              className={classNames(
                'speaker-test__audio-bars align-c justify-c',
                { 'speaker-test__audio-bars--playing': isPlaying },
              )}
            >
              <div className="speaker-test__audio-bar-single" />
              <div className="speaker-test__audio-bar-single" />
              <div className="speaker-test__audio-bar-single" />
            </div>
          )
        }
      </div>
      {
        isPlayed && (
          <div className="speaker-test__actions h6 no-mgn-b align-c">
            <div>Are you able to hear the sound?</div>
            <div
              role="button"
              onClick={() => getUserResponse('Yes')}
              className="bold primary cursor h5 no-mgn-b speaker-test__action-y"
              tabIndex={0}
            >
              Yes
            </div>
            <div
              role="button"
              onClick={() => getUserResponse('No')}
              className="bold primary cursor h5 no-mgn-b speaker-test__action-n"
              tabIndex={0}
            >
              No
            </div>
          </div>
        )
      }
      {
        userResponse === 'Yes' && (
          <>
            <div className="speaker-test__working-fine h6 no-mgn-b">
              Your speakers are working fine. If problems occurs, you
              can troubleshoot the issue to solve your problem.
            </div>
            <div className="speaker-test__test-again h6 no-mgn-b bold">
              <div>Still not satisfied.</div>
              <div
                role="button"
                onClick={startPlay}
                className="bold primary cursor speaker-test__test-again-btn"
                tabIndex={0}
              >
                Test again.
              </div>
            </div>
          </>
        )
      }
      {
        userResponse === 'No' && (
          <div className="speaker-test__try-again h6 no-mgn-b">
            <div>Try following methods to solve your issue :</div>
            <ul className="speaker-test__checklist">
              <li>Ensure your speaker is on.</li>
              <li>
                Increase the volume on your device using the volume buttons.
              </li>
              <li>Try using earphones.</li>
              <li>Restart your device.</li>
            </ul>
            <div className="bold">
              Test again to check whether your issues is resolved.
            </div>
          </div>
        )
      }
    </Field>
  );
}

export default SpeakerTest;
