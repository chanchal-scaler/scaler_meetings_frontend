import { computed, flow, makeObservable } from 'mobx';
import orderBy from 'lodash/orderBy';

import { toast } from '@common/ui/general/Toast';
import BaseContent from './baseContent';
import playlistApi from '~meetings/api/playlist';

class ComposedVideoContent extends BaseContent {
  isStopping = false;

  constructor(...args) {
    super(...args);
    makeObservable(this, {
      videos: computed,
      videoSession: computed,
    });
  }

  stop = flow(function* () {
    if (this.isStopping || !this.activeSession) {
      return;
    }

    this.isStopping = true;

    try {
      yield playlistApi.stopSession(this.meeting.slug);
    } catch (error) {
      toast.show({ message: 'Failed to stop video', type: 'error' });
    }

    this.isStopping = false;
  });

  get videos() {
    // eslint-disable-next-line camelcase
    const videos = this.contentData?.composed_video_parts || [];
    return orderBy(videos, 'video_type', 'desc');
  }

  get videoSession() {
    if (this.activeSession) {
      return this.meeting.composedVideoSessions.get(this.activeSession.id);
    } else {
      return null;
    }
  }
}

export default ComposedVideoContent;
