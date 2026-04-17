import {
  useEffect, useRef, useState,
} from 'react';

import MediaSourceError, {
  MEDIA_SOURCE_ERRORS,
} from '~meetings/errors/mediaSourceError';

const STREAM_START_TIMEOUT = 30000; // 30 sec
const TIMEOUT_ERROR = new MediaSourceError(MEDIA_SOURCE_ERRORS.TIMEOUT_ERROR);
TIMEOUT_ERROR.name = 'TimeoutError';

/**
 * MobX computeds often return fresh constraint objects each read. Using those
 * objects directly in useEffect deps causes getUserMedia to restart every
 * render and the stream never settles ("Camera is starting" forever).
 */
function stableMediaConstraintsKey(audio, video) {
  return JSON.stringify({ a: audio ?? null, v: video ?? null });
}

function useMediaStream({
  audio,
  video,
  shouldLoad,
}) {
  const [streamLoading, setStreamLoading] = useState(false);
  const [stream, setStream] = useState(null);
  const [streamError, setStreamError] = useState(null);

  const playerRef = useRef();
  const mountedRef = useRef(true);
  const timeoutRef = useRef();
  const audioRef = useRef(audio);
  const videoRef = useRef(video);
  const streamRef = useRef(null);
  const requestIdRef = useRef(0);

  audioRef.current = audio;
  videoRef.current = video;

  const constraintsKey = stableMediaConstraintsKey(audio, video);

  useEffect(() => () => {
    mountedRef.current = false;
    clearTimeout(timeoutRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!shouldLoad) {
      setStreamLoading(false);
      setStreamError(null);
      setStream(null);
      return undefined;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    let isActive = true;
    let isTimedOut = false;
    setStreamError(null);
    setStreamLoading(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (
        isActive
        && mountedRef.current
        && requestId === requestIdRef.current
      ) {
        isTimedOut = true;
        setStreamLoading(false);
        setStreamError(TIMEOUT_ERROR);
      }
    }, STREAM_START_TIMEOUT);

    async function loadStream() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoRef.current,
          audio: audioRef.current,
        });

        const isStale = (
          !isActive
          || isTimedOut
          || !mountedRef.current
          || requestId !== requestIdRef.current
        );
        if (isStale) {
          mediaStream.getTracks().forEach((track) => track.stop());
        } else {
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
          }
          streamRef.current = mediaStream;
          setStream(mediaStream);
          setStreamError(null);
          setStreamLoading(false);
        }
      } catch (error) {
        if (
          isActive
          && !isTimedOut
          && mountedRef.current
          && requestId === requestIdRef.current
        ) {
          setStream(null);
          setStreamError(error);
          setStreamLoading(false);
        }
      } finally {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }

    loadStream();

    return () => {
      isActive = false;
      isTimedOut = false;
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [shouldLoad, constraintsKey]);

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.srcObject = stream;
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        if (streamRef.current === stream) {
          streamRef.current = null;
        }
      }
    };
  }, [stream]);

  return {
    playerRef, stream, streamError, streamLoading,
  };
}

export default useMediaStream;
