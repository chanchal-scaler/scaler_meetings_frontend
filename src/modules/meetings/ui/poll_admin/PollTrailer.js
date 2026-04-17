import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import {
  DRONA_FEATURES,
  DRONA_SOURCES,
  DRONA_TRACKING_TYPES,
} from '~meetings/utils/trackingEvents';
import { Icon, Tappable, Tooltip } from '@common/ui/general';
import { AdvancedMdRenderer } from '@common/ui/markdown';
import { mobxify } from '~meetings/ui/hoc';
import analytics from '@common/utils/analytics';

function PollTrailer({
  className,
  poll,
  pollStore: store,
}) {
  const { duration, name, choices } = poll;

  const handlePreview = useCallback(() => {
    store.setPreviewPoll(poll.id);
    store.setPreviewOpen(true);
  }, [poll.id, store]);

  const handleClone = useCallback(() => {
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaEditClonedPollClick,
      click_source: DRONA_SOURCES.meetingPollsModal,
      click_text: 'Clone',
      click_feature: DRONA_FEATURES.polls,
    });

    if (store.editingPoll) {
      return;
    }

    store.clonePoll(poll);
    store.setActiveTab('create');
  }, [poll, store]);

  const handleReLaunch = useCallback(() => {
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaLaunchClonedPollClick,
      click_source: DRONA_SOURCES.meetingPollsModal,
      click_feature: DRONA_FEATURES.polls,
      click_text: 'Re-Launch Now',
    });
    if (store.editingPoll) {
      return;
    }

    store.clonePoll(poll);
    store.create(true);
  }, [poll, store]);

  const handlePollPublish = useCallback(() => {
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaLaunchPollNowClick,
      click_source: DRONA_SOURCES.meetingPollsModal,
      click_feature: DRONA_FEATURES.polls,
      click_text: 'Launch Now',
    });
    store.publish(poll.id);
  }, [store, poll]);

  const handlePollEdit = useCallback(() => {
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaEditClonedPollClick,
      click_source: DRONA_SOURCES.meetingPollsModal,
      click_text: 'Edit Poll',
      click_feature: DRONA_FEATURES.polls,
    });
    store.setEditingPoll(poll.id);
  }, [store, poll]);

  function headerUi() {
    return (
      <div className="mcq-trailer__header">
        <div className="mcq-trailer__title">
          {name}
        </div>
        {/* eslint-disable-next-line */}
        <Tooltip
          component="a"
          className="m-primary row flex-ac"
          isDisabled={!store.editingPoll}
          onClick={handleClone}
          title="Cannot perform this action while editing another poll"
        >
          <Icon className="m-r-5" name="duplicate" />
          <span>Clone</span>
        </Tooltip>
        <span className="m-h-5">|</span>
        {/* eslint-disable-next-line */}
        <a
          className="m-primary row flex-ac"
          onClick={handlePreview}
        >
          <Icon className="m-r-5" name="eye" />
          <span>Preview</span>
        </a>
      </div>
    );
  }

  function publishUi() {
    if (store.isLive) {
      if (poll.status === 'locked') {
        return (
          <Tappable
            className="btn btn-danger m-btn-cta m-r-10"
            disabled={store.isSubmitting}
            onClick={handlePollPublish}
          >
            Launch Now
          </Tappable>
        );
      } else {
        return (
          <Tappable
            className="btn btn-danger m-btn-cta m-r-10"
            disabled={store.isSubmitting}
            onClick={handleReLaunch}
          >
            Re-Launch Now
          </Tappable>
        );
      }
    } else {
      return null;
    }
  }

  function editUi() {
    if (poll.status === 'locked') {
      return (
        <Tooltip
          className="btn btn-inverted btn-primary bold"
          component={Tappable}
          disabled={Boolean(store.editingPoll)}
          isDisabled={!store.editingPoll}
          onClick={handlePollEdit}
          title="Cannot perform this action while editing another poll"
        >
          Edit Poll
        </Tooltip>
      );
    } else {
      return null;
    }
  }

  function bodyUi() {
    return (
      <div className="mcq-trailer__body mcq-trailer__body--with-controls">
        <AdvancedMdRenderer
          className="dark bold"
          mdString={poll.description}
          parseCode
          parseMathExpressions
        />
        <div className="hint bold m-b-20">
          <span>
            {choices.length || 2}
            {' '}
            options
          </span>
          <span className="p-h-5">|</span>
          <span>
            Active for:
            {' '}
            {duration}
            {' '}
            seconds
          </span>
          {poll.type === 'checkbox' && (
            <>
              <span className="p-h-5">|</span>
              <span>Multiselect</span>
            </>
          )}
        </div>
        <div className="row flex-ac">
          {publishUi()}
          {editUi()}
        </div>
      </div>
    );
  }

  return (
    <div
      className={classNames(
        'mcq-trailer',
        { [className]: classNames },
      )}
    >
      {headerUi()}
      {bodyUi()}
    </div>
  );
}

PollTrailer.propTypes = {
  poll: PropTypes.object.isRequired,
};

export default mobxify('pollStore')(PollTrailer);
