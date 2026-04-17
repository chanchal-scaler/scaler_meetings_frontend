import React, { useCallback } from 'react';
import classNames from 'classnames';

import {
  DRONA_FEATURES,
  DRONA_SOURCES,
  DRONA_TRACKING_TYPES,
} from '~meetings/utils/trackingEvents';
import { Dropdown, DropdownItem } from '@common/ui/general';
import { dialog } from '@common/ui/general/Dialog';
import { IconButton } from '~meetings/ui/general';
import { isIOS, isMobile, isSafari } from '@common/utils/platform';
import { mobxify } from '~meetings/ui/hoc';
import { ScreenShareQuality } from '~meetings/utils/media';
import { SINGLETONS_NAME } from '~meetings/utils/constants';
import { toast } from '@common/ui/general/Toast';
import { UnmuteAccessLevel } from '~meetings/utils/meeting';
import { useMediaQuery } from '@common/hooks';
import analytics from '@common/utils/analytics';
import ScreenSharePrompt from './ScreenSharePrompt';
import settingsStore from '~meetings/stores/settingsStore';

// `mobxify` should not be used on this component to inject `settingsStore`.
// Because when using meeting as a widget, since this component is passed as
// content to dialog it will be rendered outside of mobx `Provider`.
// `Dialog` is a singleton component rendered in the root of the app in which
// widget is used. Due to this mobxify cannot find `settingsStore` outside of
// `Provider` and thereby will cause the app to crash
function ScreenQualityDialogContent({ current, recommended }) {
  const handleSettingsOpen = useCallback(() => {
    dialog.close(SINGLETONS_NAME);
    settingsStore.setActiveTab('screen');
    settingsStore.setSettingsModalOpen(true);
  }, []);

  function settingUi() {
    return (
      <button
        type="button"
        className="h5 link normal"
        onClick={handleSettingsOpen}
      >
        Open screen settings
      </button>
    );
  }

  if (recommended === ScreenShareQuality.low) {
    return (
      <>
        We've detected that your upload speed is poor and recommend
        using low quality setting for this class.
        {' '}
        <br />
        {settingUi()}
      </>
    );
  } else if (current === ScreenShareQuality.low) {
    return (
      <>
        We see that your screen share quality has been set to
        {' '}
        <span className="bold dark">low</span>
        . We recommend using medium setting
        for live classes unless your upload speed is poor.
        {' '}
        <br />
        {settingUi()}
      </>
    );
  } else {
    return (
      <>
        We see that your screen share quality has been set to
        {' '}
        <span className="bold dark">{current}</span>
        . We recommend using medium
        setting for live classes.
        {' '}
        <br />
        {settingUi()}
      </>
    );
  }
}

function ShareScreen({
  className, variant, mediaStore, meetingStore: store,
}) {
  const { tablet } = useMediaQuery();
  const { meeting } = store;
  const { manager, videoBroadcasting } = meeting;

  const handleMarkScreenShareActive = useCallback(() => {
    manager.updateSettingForAll('active_screen_share_user_id', meeting.userId);
  }, [manager, meeting.userId]);

  const handleScreenShare = useCallback((
    markActive = false,
  ) => {
    if (markActive) {
      handleMarkScreenShareActive();
    }
    analytics.log({
      log_type: DRONA_TRACKING_TYPES.dronaScreenShareStartedLog,
      log_feature: DRONA_FEATURES.screenShare,
      log_source: DRONA_SOURCES.meetingBottomPanel,
      custom: {
        quality: mediaStore.screenQuality,
      },
    });
    videoBroadcasting.shareScreen();
  }, [
    handleMarkScreenShareActive,
    mediaStore.screenQuality,
    videoBroadcasting,
  ]);

  const showScreenShareDialog = useCallback(({
    content,
    markActive = false,
  }) => {
    dialog.areYouSure({
      name: SINGLETONS_NAME,
      content,
      okLabel: 'Share now',
      okClass: 'btn-primary',
      cancelLabel: 'Cancel',
      onOk: () => handleScreenShare(markActive),
    });
  }, [handleScreenShare]);

  const showScreenShareToast = useCallback(() => {
    toast.show({
      message: 'Someone is already sharing screen. Wait for them to stop',
    });
  }, []);

  const handleScreenShareProceed = useCallback(({
    markActive = false,
    content = null,
  } = {}) => {
    dialog.show({
      name: SINGLETONS_NAME,
      modalClassName: 'p-20 m-screen-share-prompt',
      content: <ScreenSharePrompt additionalContent={content} />,
      okLabel: 'Continue',
      okClass: 'btn-primary',
      cancelLabel: 'Cancel',
      withoutHeader: true,
      hasCloseButton: false,
      onOk: () => handleScreenShare(markActive),
    });
  }, [handleScreenShare]);

  const handleOpenScreenShareDialog = useCallback(({
    content,
    markActive = false,
  } = {}) => {
    if (meeting.isNewScreenShareEnabled) {
      handleScreenShareProceed({
        markActive,
        content,
      });
    } else {
      showScreenShareDialog({
        content,
        markActive,
      });
    }
  }, [handleScreenShareProceed, meeting.isNewScreenShareEnabled,
    showScreenShareDialog]);

  const handleScreenSharedConfirmed = useCallback(() => {
    if (!videoBroadcasting.hasIllustrativeContent) {
      if (meeting.isNewScreenShareEnabled) {
        handleOpenScreenShareDialog();
      } else {
        handleScreenShare();
      }
    } else if (!videoBroadcasting.isMainIllustrationLiveScreen) {
      const content = 'Your screen will be shared but will be visible to '
        + 'audience only after the pre recorded video ends.';
      if (videoBroadcasting.isMultipleScreenShareAllowed) {
        handleOpenScreenShareDialog({
          content,
          markActive: true,
        });
      } else {
        showScreenShareToast();
      }
    } else if (videoBroadcasting.isMultipleScreenShareAllowed) {
      const { name } = videoBroadcasting.mainIllustration.participant;
      handleOpenScreenShareDialog({
        content: `This will let you take over from ${name} as `
          + `the main presenter.`,
        markActive: true,
      });
    } else {
      showScreenShareToast();
    }
  }, [showScreenShareToast, videoBroadcasting,
    handleScreenShare, handleOpenScreenShareDialog,
    meeting.isNewScreenShareEnabled,
  ]);

  const handleScreenShareInit = useCallback(() => {
    const recommendedQuality = mediaStore.recommendedScreenQuality;
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaScreenShareButtonClick,
      click_source: DRONA_SOURCES.meetingBottomPanel,
      click_feature: DRONA_FEATURES.screenShare,
    });
    if (meeting.isNewScreenShareEnabled) {
      // resetting previously stored screen share quality
      mediaStore.resetScreenQuality();
    }
    if (isIOS() || isSafari() || isMobile()) {
      const data = {
        message: 'Your device/browser does not support screen share',
        duration: 2000,
      };
      toast.show(data);
    } else if (
      !recommendedQuality || recommendedQuality === mediaStore.screenQuality
    ) {
      handleScreenSharedConfirmed();
    } else {
      dialog.show({
        name: SINGLETONS_NAME,
        title: 'Change screen quality',
        content: (
          <ScreenQualityDialogContent
            current={mediaStore.screenQuality}
            recommended={recommendedQuality}
          />
        ),
        okLabel: 'Use recommended',
        okClass: 'btn-primary',
        cancelLabel: 'Use my setting',
        onOk: () => {
          mediaStore.setScreenQuality(recommendedQuality);
          handleScreenSharedConfirmed();
        },
        onCancel: () => {
          mediaStore.setRecommendedScreenQuality(null);
          handleScreenSharedConfirmed();
        },
      });
    }
  }, [handleScreenSharedConfirmed, mediaStore,
    meeting.isNewScreenShareEnabled]);

  if (tablet) {
    return null;
  } else if (
    !videoBroadcasting
    || !videoBroadcasting.isStreaming
    || (
      manager.isTemporaryHost
      && manager.settings.unmute_access !== UnmuteAccessLevel.all
    )
  ) {
    return (
      <IconButton
        className={classNames(
          'btn-disabled',
          { [className]: className },
        )}
        icon="share-screen-off"
        data-cy="meetings-screen-share-disabled-button"
        label="Audience cannot use this feature"
      />
    );
  } else if (videoBroadcasting.isSharingScreen) {
    if (!videoBroadcasting.isMainIllustrationLiveScreen) {
      return (
        <IconButton
          className={classNames(
            'warning',
            { [className]: className },
          )}
          icon="screen-pause"
          label="
            You screen share will automatically resume after the pre recorded
            video ends. (Click to completely stop screen share)
          "
          onClick={() => meeting.videoBroadcasting.unshareScreen()}
        />
      );
    } else if (videoBroadcasting.isMyScreenShareActive) {
      return (
        <IconButton
          className={classNames(
            'm-topic-card__ok-btn',
            { [className]: className },
          )}
          icon="share-screen-off"
          label="Stop screen share"
          data-cy="meetings-screen-share-stop-button"
          onClick={() => meeting.videoBroadcasting.unshareScreen()}
        >
          {variant !== 'compact' && (
            <div className="h6 m-l-5">Stop Screen Sharing</div>
          )}
        </IconButton>
      );
    } else {
      return (
        <Dropdown
          className={classNames(
            'warning',
            { [className]: className },
          )}
          component={IconButton}
          icon="screen-pause"
          label="You screen share has been paused"
          popoverProps={{
            className: 'm-dropdown',
            extraScope: 'meeting-app',
            placement: 'top',
            margin: {
              top: -10,
            },
          }}
        >
          <DropdownItem
            className="btn btn-default"
            onClick={handleMarkScreenShareActive}
          >
            Resume Screen Share
          </DropdownItem>
          <DropdownItem
            className="btn btn-danger"
            onClick={() => meeting.videoBroadcasting.unshareScreen()}
          >
            End Screen Share
          </DropdownItem>
        </Dropdown>
      );
    }
  } else {
    return (
      <IconButton
        className={className}
        disabled={meeting.isScreenShareStarting}
        icon="share-screen"
        label="Share screen"
        data-cy="meetings-screen-share-start-button"
        onClick={handleScreenShareInit}
      >
        {variant !== 'compact' && (
          <div
            className="h6 m-l-5"
            data-cy="meetings-start-screenshare-button"
          >
            Start Screen Sharing
          </div>
        )}
      </IconButton>
    );
  }
}

export default mobxify('mediaStore', 'meetingStore')(ShareScreen);
