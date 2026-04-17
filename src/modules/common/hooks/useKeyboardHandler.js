import { useEffect, useState } from 'react';

const KEY_PRESS_TIMEOUT = 50;

/**
 * @param {*} ref Ref for the react node on which we want to add handlers
 * @param {*} targetKey The key for which we are listening
 * @param {object} options
 * @param {boolean} options.preventDefault If true will disable the default
 * behaviours like scrolling the window or changing cursor position etc.
 * @param {boolean} options.allowRepeat If true will fire continous events
 * when key is pressed and hold
 * @returns {boolean} If key was just pressed or not
 */
const useKeyboardHandler = function (ref, targetKey, options = {}) {
  const [keyPressed, setKeyPressed] = useState(false);
  const { preventDefault = true, allowRepeat = true } = options;

  useEffect(() => {
    let timeout;

    function downHandler(event) {
      if (event.key === targetKey) {
        if (preventDefault) event.preventDefault();

        if (event.repeat && !allowRepeat) return;

        setKeyPressed(true);
        timeout = setTimeout(() => setKeyPressed(false), KEY_PRESS_TIMEOUT);
      }
    }

    function upHandler(event) {
      if (event.key === targetKey) {
        if (preventDefault) event.preventDefault();

        clearTimeout(timeout);
        setKeyPressed(false);
      }
    }

    const keyRef = ref.current;
    keyRef.addEventListener('keydown', downHandler);
    keyRef.addEventListener('keyup', upHandler);

    return () => {
      clearTimeout(timeout);
      keyRef.removeEventListener('keydown', downHandler);
      keyRef.removeEventListener('keyup', upHandler);
    };
  }, [allowRepeat, preventDefault, ref, targetKey]);

  return keyPressed;
};

export default useKeyboardHandler;
