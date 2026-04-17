import {
  useCallback, useEffect, useRef, useState,
} from 'react';

import { apiRequest } from '@common/api/utils';
import { trackGAEvent } from '@common/utils/ga';
import useSocket from './useSocket';
import useUnmountedRef from './useUnmountedRef';

const DEFAULT_GA_EVENT_CATEGORY = 'socket-fallback-to-polling';
/**
 * CHECK_FOR_STALE_DATA_INTERVAL is the interval we check for the stale data
 */
const CHECK_FOR_STALE_DATA_INTERVAL = 8000; // 8 sec
/**
 * STALE_DATA_THRESHOLD is the threshold for the stale data, if data is
 * older than STALE_DATA_THRESHOLD, we will use the polling
 */
const STALE_DATA_THRESHOLD = 6000; // 6 sec
/**
 * Initial pollingOptions for setting up the polling service
 * @param {Object} pollingOptions
 * For example:-
 * pollingOptions = {
 *  retryCount: the no of times to retry when the api call fails
 * }
 * @param {String} channel - channel to subscribe to
 * @param {String} fallbackURL - url to fallback to if socket fails
 * @param {String} dataKey - key to get the data from the socket subscription
 * @param {Object} socketData - data to send to the socket on init
 * @param {Boolean} shouldPoll - if true, it would start listning to socket
 * data channel and implement necessary fallbacks
 */

function useSocketFallbackToPolling({
  channel,
  fallbackURL,
  pollingOptions,
  shouldPoll,
  dataKey,
  socketData = {},
  gaEventCategory = DEFAULT_GA_EVENT_CATEGORY,
}) {
  const { retryCount = 0 } = pollingOptions;
  /**
   * data - the data received from the socket
   */
  const [data, setData] = useState(null);
  /**
   * error - the error received from polling if any
   */
  const [error, setError] = useState(null);
  /**
   * lastDataReceivedAt is used to check if the data is stale
   * if the data is stale, it would fallback to polling.
   */
  const lastDataRecievedAt = useRef(null);
  const isUnmounted = useUnmountedRef();
  const checkForStaleDataInterval = useRef(null);
  const internalRetryCount = useRef(retryCount);

  const socket = useSocket(channel, socketData);

  /**
   * To be called by the user of this service or when the poll api fails beyond
   * retry count. This will stop polling, clear all intervals and reset
   * error/data.
   */
  const stopPolling = useCallback(() => {
    if (!isUnmounted.current) {
      if (checkForStaleDataInterval.current) {
        clearInterval(checkForStaleDataInterval.current);
        checkForStaleDataInterval.current = null;
      }
      lastDataRecievedAt.current = null;
      setError(null);
      setData(null);
      internalRetryCount.current = retryCount;
    }
  }, [isUnmounted, retryCount]);

  /**
   * handleError - to be called when the api/polling call fails
   */
  const handleError = useCallback((_error) => {
    const shouldRetry = internalRetryCount.current > 0;
    /**
     * shouldRetry API call if it fails and retryCount is greater than 0
     * otherwise it will stop polling
     */
    if (shouldRetry) {
      internalRetryCount.current -= 1;
    } else {
      setError(_error);
      stopPolling();
      trackGAEvent({
        category: gaEventCategory,
        action: 'error',
        label: _error.message,
      });
    }
  }, [gaEventCategory, stopPolling]);

  const fetchDataThroughPolling = useCallback(async () => {
    if (!fallbackURL) {
      throw new Error(
        'No url provided to poll.',
      );
    }

    try {
      const response = await apiRequest('GET', fallbackURL);
      setData(response);
      // reset the retry count
      internalRetryCount.current = retryCount;
    } catch (_error) {
      handleError(_error);
    }
  }, [fallbackURL, retryCount, handleError]);

  const isDataStale = useCallback(() => (
    // if socket connection did not receive any data
    !lastDataRecievedAt.current
    // if socket connection did not receive any data within the interval
    // this may happen when socket gets disconnected in the middle of the
    // execution.
    || (Date.now() - lastDataRecievedAt.current) > STALE_DATA_THRESHOLD
  ), []);

  /**
   * pollIfStaleData checks whether the data is updated by the
   * socket or not. If the data is updated by the socket in the
   * given interval, then we would not poll.
   */
  const pollIfStaleData = useCallback(() => {
    if (isDataStale()) {
      fetchDataThroughPolling();

      // lastDataRecievedTimestamp is used to evaluate when data
      // was last received from the socket, if socket did not receive
      // any data then we would set the lastDataRecievedTimestamp to
      // the current timestamp - STALE_DATA_THRESHOLD.
      const lastDataRecievedTimestamp = lastDataRecievedAt.current ?? (
        Date.now() - STALE_DATA_THRESHOLD
      );
      // staleDataAge is the diff between last data received
      // and the current time in seconds
      const staleDataAge = (Date.now() - lastDataRecievedTimestamp) / 1000;

      trackGAEvent({
        category: gaEventCategory,
        action: 'data-received',
        label: 'polling',
        timingVar: 'staleDataAge',
        value: staleDataAge, // in seconds
      });
    }
  }, [fetchDataThroughPolling, gaEventCategory, isDataStale]);

  /**
   * Starter useEffect to start polling interval. Polling interval would
   * be started only if shouldPoll is true.
   */
  useEffect(() => {
    if (checkForStaleDataInterval.current) {
      return;
    }

    if (shouldPoll) {
      checkForStaleDataInterval.current = setInterval(
        pollIfStaleData,
        /**
         * CHECK_FOR_STALE_DATA_INTERVAL is the time we wait for the socket to
         * respond before we start polling
         */
        CHECK_FOR_STALE_DATA_INTERVAL,
      );
    }
  }, [pollIfStaleData, shouldPoll]);

  /**
   * remove all timeouts when component unmounts to prevent
   * memory leaks and to prevent state from being updated
   * when component unmounts
   */
  useEffect(() => () => {
    stopPolling();
  }, [stopPolling]);

  /**
   * Immidiatelly stop polling and clear timeouts if
   * shouldPoll is false
   */
  useEffect(() => {
    if (!shouldPoll) {
      stopPolling();
    }
  }, [shouldPoll, stopPolling]);

  /**
   * dataCallback - callback to be called when data is received from the socket.
   * This would set lastDataReceivedAt to the current time. We would
   * poll if the data is stale(shouldPoll is true and data recieved from
   * socket is not within stale data threshold).
   */
  const dataCallback = useCallback((payload) => {
    lastDataRecievedAt.current = Date.now();
    setData(payload);
    setError(null);
    trackGAEvent({
      category: gaEventCategory,
      action: 'data-received',
      label: 'socket',
    });
  }, [gaEventCategory]);

  /**
   * Add data event listener to the socket, if the socket is not
   * connected, then we will start polling. This is used to maintain
   * last data received timestamp from the socket
   */
  useEffect(() => {
    if (socket) {
      socket.on(dataKey, dataCallback);
    }

    return () => {
      if (!socket) {
        return;
      }
      socket.off(dataKey, dataCallback);
    };
  }, [socket, dataCallback, dataKey]);

  return {
    socket,
    data,
    error,
  };
}

export default useSocketFallbackToPolling;
