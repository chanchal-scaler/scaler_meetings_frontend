import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import {
  DRONA_FEATURES,
  DRONA_SOURCES,
  DRONA_TRACKING_TYPES,
} from '~meetings/utils/trackingEvents';
import { Icon, Tappable } from '@common/ui/general';
import { AdvancedMdRenderer } from '@common/ui/markdown';
import { mobxify } from '~meetings/ui/hoc';
import analytics from '@common/utils/analytics';

function TemplateTrailer({
  className,
  index,
  poll,
  pollStore: store,
}) {
  const { duration, name, choices } = poll;

  const handleClone = useCallback(() => {
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaEditClonedPollClick,
      click_source: DRONA_SOURCES.meetingPollsModal,
      click_text: 'Clone',
      click_feature: DRONA_FEATURES.poll,
    });
    store.clonePoll(poll);
    store.setActiveTab('create');
  }, [poll, store]);

  const handleLaunchPoll = useCallback(() => {
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaLaunchClonedPollClick,
      click_source: DRONA_SOURCES.meetingPollsModal,
      click_text: 'Launch Now',
      click_feature: DRONA_FEATURES.poll,
    });
    store.publishTemplate(poll);
  }, [store, poll]);

  function headerUi() {
    return (
      <div className="mcq-trailer__header">
        <div className="mcq-trailer__title">
          {name}
        </div>
        {/* eslint-disable-next-line */}
        <a
          className="m-primary row flex-ac"
          onClick={handleClone}
        >
          <Icon className="m-r-5" name="duplicate" />
          <span>Clone</span>
        </a>
        <span className="m-h-5">|</span>
        {/* eslint-disable-next-line */}
        <a
          className="m-primary row flex-ac"
          onClick={() => store.setPreviewTemplate(index)}
        >
          <Icon className="m-r-5" name="eye" />
          <span>Preview</span>
        </a>
      </div>
    );
  }

  function publishUi() {
    if (store.isLive) {
      return (
        <Tappable
          className="btn btn-danger m-btn-cta m-r-10"
          disabled={store.isSubmitting}
          onClick={handleLaunchPoll}
        >
          Launch Now
        </Tappable>
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

TemplateTrailer.propTypes = {
  index: PropTypes.number.isRequired,
  poll: PropTypes.object.isRequired,
};

export default mobxify('pollStore')(TemplateTrailer);
