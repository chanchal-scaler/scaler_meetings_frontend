import { action, makeObservable, observable } from 'mobx';

import { NotImplementedError } from '@common/errors';
import { StreamPrimaryRanks } from '~meetings/utils/stream';

/**
 * Base class for all streams in a meeting. Think of streams as any
 * live media being shared or running during a meeting.
 *
 * For ex: Live screen share, camera output of a user, live coding environment,
 * interactive whiteboard etc.
 *
 * Note: Do not use this class directly
 */
class Stream {
  /**
   * Add this in extending class to indicate the type of content rendered by
   * the stream class
   */
  static contentType = null;

  isLoaded = false;

  isLoading = false;

  loadError = null;

  /**
   * Indicates if a stream is active and can be rendered in UI.
   * Use this in cases where you need some conditions to be met to be
   * able to render stream on UI.
   */
  isActive = true;

  numLoadAttempts = 0;

  constructor(channel, id, userId) {
    this._channel = channel;
    this._id = id;
    this._userId = userId;
    makeObservable(this, {
      isActive: observable,
      isLoaded: observable,
      isLoading: observable,
      loadError: observable.ref,
      newLoadAttempt: action,
      numLoadAttempts: observable,
      resetLoadAttempts: action,
      setActive: action,
    });
  }

  /**
   * Implement in extending classes
   *
   * If you need to do some additional clean up when a stream is removed from
   * meeting then add the clean up logic here in the extending class
   */
  // eslint-disable-next-line class-methods-use-this
  destroy() {
    throw new NotImplementedError('destroy');
  }

  newLoadAttempt() {
    this.numLoadAttempts += 1;
  }

  /**
   * Implement in extending classes
   *
   * If you need to load some meta data before being able to play a stream,
   * add the logic for it here. Else implement this method with blank body
   */
  // eslint-disable-next-line class-methods-use-this
  load() {
    throw new NotImplementedError('load');
  }

  resetLoadAttempts() {
    this.numLoadAttempts = 0;
  }

  setActive(isActive) {
    this.isActive = isActive;
  }

  /**
   * Implement in extending classes
   *
   * Returns some serialised information about the stream. Useful when you need
   * to send data to a external service.
   */
  // eslint-disable-next-line class-methods-use-this
  toJSON() {
    throw new NotImplementedError('toJSON');
  }

  get contentType() {
    return this.constructor.contentType;
  }

  get channel() {
    return this._channel;
  }

  get id() {
    return this._id;
  }

  /**
   * Indicates that stream has illustrative content like screen share,
   * whiteboard, code editor.
   */
  get isIllustrative() {
    return this.primaryRank > 1;
  }

  get manager() {
    return this.meeting.manager;
  }

  get meeting() {
    return this.channel.meeting;
  }

  get participant() {
    return this.meeting.getParticipant(this.userId);
  }

  /**
   * Streams with higher primary rank will be rendered first. For a given
   * stream instance primary rank should not change after it is created.
   */
  // eslint-disable-next-line class-methods-use-this
  get primaryRank() {
    return StreamPrimaryRanks.default;
  }

  /**
   * If 2 streams have same primary rank then they will be ordered based on
   * their secondary rank. For a given stream its secondary rank can change
   * based of user interactions and behaviour. For example in video content
   * it can be the volume level. Secondary ranks should be normalized between
   * 0 to 1
   */
  // eslint-disable-next-line class-methods-use-this
  get secondaryRank() {
    return 0;
  }

  /**
   * This method should be overwritten in case we dont
   * want to render a specific type of stream, as a default
   * case all streams are allowed to render
   */
  // eslint-disable-next-line class-methods-use-this
  get shouldRender() {
    return true;
  }

  get userId() {
    return this._userId;
  }
}

export default Stream;
