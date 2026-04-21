import React, { useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import cogoToast from 'cogo-toast';
import classNames from 'classnames';

import * as CustomPropTypes from '@common/utils/propTypes';
import { copyToClipboard } from '@common/utils/misc';
import { useOutsideClick } from '@common/hooks';
import Icon from './Icon';
import Popover from './Popover';
import Tappable from './Tappable';

import facebookIcon from '@common/images/png/facebook.png';
import linkedinIcon from '@common/images/png/linkedin.png';
import linkIcon from '@common/images/png/link.png';
import telegramIcon from '@common/images/png/telegram.png';
import twitterIcon from '@common/images/png/twitter.png';
import whatsappIcon from '@common/images/png/whatsapp2.png';

const shareMediumLabelsMap = {
  facebook: 'Facebook',
  link: 'Copy Link',
  linkedin: 'LinkedIn',
  telegram: 'Telegram',
  twitter: 'Twitter',
  whatsapp: 'Whatsapp',
};

const shareMediumImagesMap = {
  facebook: facebookIcon,
  link: linkIcon,
  linkedin: linkedinIcon,
  telegram: telegramIcon,
  twitter: twitterIcon,
  whatsapp: whatsappIcon,
};

const shareMedia = [
  'whatsapp', 'telegram',
  'facebook', 'twitter',
  'linkedin',
];

function ShareButton({
  component = 'a',
  hint,
  onClick,
  shareLink,
  shareMessage,
  copyMessage = 'Link has been copied',
  placement,
  popoverClassName,
  location,
  onTrack,
  ...remainingProps
}) {
  const ref = useRef(null);
  const popoverRef = useRef(null);
  const [isPopoverOpen, setPopoverOpen] = useState(false);

  // This is hacky way. Find some way to make `useOutsideClick` work with
  // react DOM tree instead of actual DOM tree.
  const handleOutsideClick = useCallback((event) => {
    if (popoverRef.current && !popoverRef.current.contains(event.target)) {
      setPopoverOpen(false);
    }
  }, []);

  const handlePopoverClose = useCallback(() => {
    setPopoverOpen(false);
  }, []);

  const handleTriggerClick = useCallback((event) => {
    if (window.navigator.share) {
      try {
        window.navigator.share({
          text: shareMessage,
          url: shareLink,
        });
      } catch (error) {
        cogoToast.error('Error while sharing. Please try again');
      }
    } else {
      if (!isPopoverOpen) {
        copyToClipboard(shareLink);
      }
      setPopoverOpen(!isPopoverOpen);
    }

    // eslint-disable-next-line no-unused-expressions
    onClick && onClick(event);
  }, [isPopoverOpen, onClick, shareLink, shareMessage]);

  useOutsideClick(ref, handleOutsideClick);

  function share(channel) {
    let link;
    const encodedShareLink = encodeURIComponent(shareLink);
    if (onTrack) onTrack(channel);

    switch (channel) {
      case 'whatsapp':
        link = `https://wa.me/?text=${shareMessage}. ${encodedShareLink}`;
        break;
      case 'twitter':
        link = `https://twitter.com/intent/tweet`
          + `?text=${shareMessage}. ${encodedShareLink}`;
        break;
      case 'linkedin':
        link = `https://www.linkedin.com/shareArticle?mini=true`
          + `&url=${encodedShareLink}&title=&summary=${shareMessage}&source=`;
        break;
      case 'telegram':
        link = `https://telegram.me/share/url?text=${shareMessage}`
          + `&url=${encodedShareLink}`;
        break;
      case 'facebook':
        link = `https://www.facebook.com/sharer/sharer.php?u=`
          + `${encodedShareLink}`;
        break;
      case 'link':
        link = false;
        copyToClipboard(shareLink);
        cogoToast.success(copyMessage);
        break;
      default:
        link = false;
        // eslint-disable-next-line
        console.log('Share platform not recognized');
    }

    if (link) {
      window.open(link);
    }
    setPopoverOpen(false);
  }

  function shareMediumUi(medium) {
    const label = shareMediumLabelsMap[medium];
    const icon = shareMediumImagesMap[medium];

    return (
      <Tappable
        key={medium}
        className="share-medium"
        onClick={() => share(medium)}
      >
        <div className="share-medium__icon">
          <img
            alt={label}
            className={`share-medium__icon-${label}`}
            src={icon}
          />
        </div>
      </Tappable>
    );
  }

  function popoverUi() {
    return (
      <Popover
        ref={popoverRef}
        anchorRef={ref}
        className={classNames(
          'card share-popover',
          { [popoverClassName]: popoverClassName },
        )}
        isOpen={isPopoverOpen}
        placement={placement}
        location={location}
        onClose={handlePopoverClose}
      >
        <>
          <div className="share-popover__copied-container">
            <Icon name="check" className="share-popover__copied-icon" />
            <span className="share-popover__copied-text">
              {copyMessage}
            </span>
          </div>
          <div className="share-popover__share-via">
            <div className="m-r-20">Share via,</div>
            <div className="share-popover__media-map">
              {shareMedia.map(shareMediumUi)}
            </div>
          </div>
          <div className="share-popover__link-container">
            <span className="share-popover__link">{shareLink}</span>
            <Tappable
              className="share-popover__copy-icon-btn"
              onClick={() => share('link')}
            >
              <Icon name="copy" className="share-popover__copy-icon" />
            </Tappable>
          </div>
        </>
      </Popover>
    );
  }

  function triggerUi() {
    return React.createElement(
      component,
      {
        ref,
        onClick: handleTriggerClick,
        ...remainingProps,
      },
    );
  }

  return (
    <>
      {triggerUi()}
      {popoverUi()}
    </>
  );
}

ShareButton.propTypes = {
  component: CustomPropTypes.componentPropType.isRequired,
  hint: PropTypes.string,
  onClick: PropTypes.func,
  shareLink: PropTypes.string.isRequired,
  shareMessage: PropTypes.string.isRequired,
  copyMessage: PropTypes.string,
  popoverClassName: PropTypes.string,
  placement: PropTypes.string,
  location: PropTypes.object,
  onTrack: PropTypes.func,
};

export default ShareButton;
