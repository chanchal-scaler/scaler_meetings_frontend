import cloneDeep from 'lodash/cloneDeep';

import { generateUUID } from '@common/utils/misc';
import {
  getNonOverlappingIntervals,
  mergeIntervals,
} from '@common/utils/intervals';
import { timeRangesToIntervals } from '@common/utils/dataTransformers';
import capturedEventsApi from '~video_player/api/capturedEvents';
import LocalStorage from '@common/lib/localStorage';

const LS_KEY = '__vp_tracker__';
const EVENTS_STORE = LocalStorage.getInstance(LS_KEY);

export const VideoRecordingTypes = {
  zoom: 'zoom',
  drona: 'drona',
  testProblem: 'test-problem',
};

const VideoEventTypes = {
  play: 'play',
  pause: 'pause',
};

function getAllEvents() {
  EVENTS_STORE.$_sync();
  return EVENTS_STORE.events || [];
}

class VideoProgressTracker {
  /**
   * Syncs all events present in localstorage with server
   */
  static async syncAllEvents() {
    const allEvents = getAllEvents();
    if (allEvents.length === 0) return;

    // This logic is to make sure that if any events were captured while the
    // syncing occurs then we don't miss them
    const processedEventIds = await capturedEventsApi.send(allEvents);
    const remainingEvents = getAllEvents().filter(
      event => !processedEventIds.includes(event.unique_id),
    );
    EVENTS_STORE.events = remainingEvents;
  }

  /**
   * Unique ID for current tracking session.
   * New tracking session starts after every attempt to sync events with server
   */
  trackingSessionId = generateUUID();

  /**
   * Contains a map of videoId vs video intervals of the video which are
   * already sent to the server
   */
  syncedIntervals = {};

  /**
   * Contains a map of videoId vs video intervals of the video which have
   * been watched by the user after the page has been loaded
   */
  allIntervals = {};

  /**
   * @param {String} type type of the videos whose progress will be tracked.
   * Pass one of the values of `VideoRecordingTypes`
   */
  constructor(type, extraParams) {
    this._type = type;
    this._extraParams = extraParams;
  }

  /**
   * Stores updated intervals in localstorage to sync with server later
   * in bulk. Some common trigger points to sync events are when user is
   * switch tab, leaving/reloading page etc.
   *
   * Use `sync` method to sync intervals with server.
   *
   * @param {Number} videoId ID of video which can help identify the video in
   * database
   * @param {TimeRanges} ranges `played` property of the HTMLMediaElement
   * which is playing the video
   */
  update(videoId, ranges) {
    if (!ranges) {
      return;
    }

    const currentIntervals = timeRangesToIntervals(ranges);
    const [
      allIntervals,
      unSyncedIntervals,
    ] = this._calculateAllAndUnSyncedIntervals(
      videoId,
      currentIntervals,
    );

    const events = this._intervalsToEvents(videoId, unSyncedIntervals);
    const uniqueVideoId = this._calculateUniqueVideoId(videoId);
    this.allIntervals = {
      ...this.allIntervals,
      [uniqueVideoId]: allIntervals,
    };
    const otherVideoEvents = this._findOtherVideoEvents(videoId);
    EVENTS_STORE.events = [...otherVideoEvents, ...events];
  }

  /**
   * Syncs events of current session with server
   */
  async sync() {
    const currentSessionEvents = this.allEvents.filter(
      event => event.session_id === this.trackingSessionId,
    );
    if (currentSessionEvents.length === 0) return;

    try {
      const processedEventIds = await capturedEventsApi.send(
        currentSessionEvents,
        { session_id: this.trackingSessionId },
      );
      const allEvents = [...this.allEvents];
      const unSyncedEvents = allEvents.filter(
        (event) => !processedEventIds.includes(event.unique_id),
      );
      EVENTS_STORE.events = unSyncedEvents;
      this.syncedIntervals = cloneDeep(this.allIntervals);
    } finally {
      this.trackingSessionId = generateUUID();
    }
  }

  // eslint-disable-next-line class-methods-use-this
  get allEvents() {
    return getAllEvents();
  }

  /* Private methods */

  _calculateAllAndUnSyncedIntervals(videoId, currentIntervals) {
    const syncedIntervals = this._findSyncedIntervals(videoId);
    const previousIntervals = this._findPreviousIntervals(videoId);

    // Merge overalapping intervals
    const mergedIntervals = mergeIntervals([
      ...previousIntervals,
      ...currentIntervals,
      ...syncedIntervals,
    ]);

    // Extract only the intervals which are not yet synced
    const newIntervals = getNonOverlappingIntervals(
      mergedIntervals,
      syncedIntervals,
    );

    return [mergedIntervals, newIntervals];
  }

  _calculateUniqueVideoId(id) {
    return `${this._type}-${id}`;
  }

  _findOtherVideoEvents(videoId) {
    return this.allEvents.filter((event) => (
      event.session_id !== this.trackingSessionId
      || event.resource_type !== this._type
      || event.resource_id !== videoId
    ));
  }

  /**
   * @param {Number} videoId ID of video which can help identify the video in
   * database
   * @returns {Array} All intervals of this given videoId stored so far
   */
  _findPreviousIntervals(videoId) {
    const uniqueVideoId = this._calculateUniqueVideoId(videoId);
    const intervals = this.allIntervals[uniqueVideoId] || [];
    return [...intervals];
  }

  /**
   * @param {Number} videoId ID of video which can help identify the video in
   * database
   * @returns {Array} Intervals of the given videoId which are already synced
   * with server
   */
  _findSyncedIntervals(videoId) {
    const uniqueVideoId = this._calculateUniqueVideoId(videoId);
    const intervals = this.syncedIntervals[uniqueVideoId] || [];
    return [...intervals];
  }

  _intervalsToEvents(videoId, intervals) {
    const uniqueVideoId = this._calculateUniqueVideoId(videoId);

    const baseEvent = {
      session_id: this.trackingSessionId,
      resource_type: this._type,
      resource_id: videoId,
      ...this._extraParams,
    };

    const events = [];
    intervals.forEach((event, index) => {
      events.push({
        ...baseEvent,
        unique_id: `${uniqueVideoId}_${Date.now()}_start_${index}`,
        event_type: VideoEventTypes.play,
        time: event[0],
      });

      events.push({
        ...baseEvent,
        ...{
          unique_id: `${uniqueVideoId}_${Date.now()}_end_${index}`,
          event_type: VideoEventTypes.pause,
          time: event[1],
        },
      });
    });
    return events;
  }
}

export default VideoProgressTracker;
