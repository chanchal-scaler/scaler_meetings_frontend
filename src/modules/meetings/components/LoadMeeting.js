import React, { useEffect, useCallback } from 'react';
import { Observer } from 'mobx-react';

import { DRONA_TRACKING_TYPES } from '~meetings/utils/trackingEvents';
import { getDeviceType, getRequestSource } from '@common/utils/platform';
import { HintLayout, LoadingLayout } from '@common/ui/layouts';
import { MEETING_ACTION_TRACKING, STRINGS } from '~meetings/utils/constants';
import { mobxify } from '~meetings/ui/hoc';
import { setMeetingContext, clearMeetingContext } from '~meetings/utils/gtm';
import { VIEW_TYPES } from '@vectord/analytics';
import analytics from '@common/utils/analytics';
import analyticsApi from '~meetings/api/analytics';
import analyticsOld from '~meetings/analytics';
import layoutStore from '~meetings/stores/layoutStore';

function LoadMeeting({
  children,
  mediaStore,
  meetingStore: store,
  slug,
}) {
  const { data, isLoading, loadError } = store;
  const deviceType = getDeviceType();
  const devicePlatform = getRequestSource();

  const setMeetingAnalyticsContext = useCallback(async () => {
    try {
      const result = await analyticsApi.getMeetingTraits(slug);
      const superAttributes = {
        ...result.meeting_analytics_attributes,
        mode: layoutStore.mode,
        widget: layoutStore.isWidget,
        device_platform: devicePlatform,
        device_type: deviceType,
      };
      analytics.setSuperAttributes(superAttributes);
    } catch (e) {
      // TODO: Send to sentry
      // eslint-disable-next-line no-console
      console.error('Error in setMeetingAnalyticsContext', e);
    }
  }, [devicePlatform, deviceType, slug]);

  useEffect(() => {
    async function loadMeeting() {
      await setMeetingAnalyticsContext();
      store.load(slug);
      setMeetingContext(slug);
    }

    loadMeeting();
    return () => {
      store.unload();
      clearMeetingContext();
    };
  }, [store, slug, setMeetingAnalyticsContext]);

  useEffect(() => {
    if (store.errorMessage) {
      window.GTMtracker?.pushEvent({
        event: 'errors',
        data: {
          error_message: store.errorMessage,
          slug,
        },
      });
      analyticsOld.view(
        MEETING_ACTION_TRACKING.unableToJoinMeeting,
        'Meeting App', {
          view_product: 'drona',
          view_feature: 'pre_meeting_join',
          meeting_slug: slug,
          error_message: store.errorMessage,
        },
      );
      analytics.view({
        view_type: VIEW_TYPES.dashboard,
        view_name: DRONA_TRACKING_TYPES.dronaMeetingNotFoundView,
        custom: {
          error_message: store.errorMessage,
        },
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadError]);

  if (!mediaStore.hasMediaDevicesSupport) {
    return (
      <HintLayout
        isTransparent
        message={STRINGS.unsupportedBrowser}
      />
    );
  } else if (data && data.slug === slug) {
    return (
      <Observer>
        {() => children({ data })}
      </Observer>
    );
  } else if (isLoading) {
    return <LoadingLayout isTransparent />;
  } else if (loadError) {
    return (
      <HintLayout
        actionFn={
          store.isFixableError
            ? () => store.load(slug, true)
            : null
        }
        actionLabel="Try again"
        isTransparent
        message={store.errorMessage}
      />
    );
  } else {
    return null;
  }
}

export default mobxify('mediaStore', 'meetingStore')(LoadMeeting);
