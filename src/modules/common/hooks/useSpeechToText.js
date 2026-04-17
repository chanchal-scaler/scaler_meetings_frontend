import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition';

import {
  isArc,
  isChrome,
} from '@common/utils/platform';

export const REACT_SPEECH_RECOGNITION_ERRORS = {
  browserNotSupported: 'browserNotSupported',
  microphoneAccessNotGranted: 'microphoneAccessNotGranted',
  userNotOnline: 'userNotOnline',
};

/**
 * useSpeechToText is a wrapper around react-speech-to-text package
 * which also takes care of browser compatibility.
 * PackageDocumentation: https://github.com/JamesBrill/react-speech-recognition/
 * Note: Currently only enabling it for chrome, due to only reliable support
 * All languages supported: http://stackoverflow.com/a/14302134/338039
 *
 * Please note: abortListening, startListening, and stopListening are async func
 *
 * @param {String} speechLanguage - Expected Audio Language from user
 * @param {Boolean} continuousListeningEnabled - if false Microphone will switch
 * off automatically if mic stops listening, keeping default value true to give
 * the control to user when to mute/unmute
 *
 * @returns {object} - { success, abortListening, finalTranscript, isListening,
 *                       resetTranscription, startListening, stopListening
 *                     }
 */

function useSpeechToText({
  speechLanguage = 'en-IN',
  continuousListeningEnabled = true,
} = {}) {
  const {
    browserSupportsContinuousListening,
    browserSupportsSpeechRecognition,
    finalTranscript,
    interimTranscript,
    isMicrophoneAvailable,
    listening,
    resetTranscript,
  } = useSpeechRecognition();

  const continuousListening = browserSupportsContinuousListening
    && continuousListeningEnabled;

  const startListening = () => {
    SpeechRecognition.startListening({
      continuous: continuousListening,
      language: speechLanguage,
    });
  };

  if (!(browserSupportsSpeechRecognition && isChrome() && !isArc())) {
    return {
      success: false,
      error: REACT_SPEECH_RECOGNITION_ERRORS.browserNotSupported,
    };
  } else if (!isMicrophoneAvailable) {
    return {
      success: false,
      error: REACT_SPEECH_RECOGNITION_ERRORS.microphoneAccessNotGranted,
    };
  } else if (!navigator.onLine) {
    return {
      success: false,
      error: REACT_SPEECH_RECOGNITION_ERRORS.userNotOnline,
    };
  } else {
    return {
      success: true,
      error: null,
      abortListening: SpeechRecognition.abortListening,
      finalTranscript,
      interimTranscript,
      isListening: listening,
      resetTranscription: resetTranscript,
      startListening,
      stopListening: SpeechRecognition.stopListening,
    };
  }
}

export default useSpeechToText;
