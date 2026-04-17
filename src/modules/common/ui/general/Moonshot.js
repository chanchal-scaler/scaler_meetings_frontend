import React, {
  Children,
  cloneElement,
  useState,
} from 'react';
import cogoToast from 'cogo-toast';

import { copyToClipboard } from '@common/utils/misc';
import { useMoonshotAsset, useSocialClick } from '@common/hooks/useMoonshot';
import Facebook from '@common/images/svg/facebook.svg';
import Link from '@common/images/png/link.png';
import LinkedIn from '@common/images/svg/linkedin.svg';
import Twitter from '@common/images/svg/twitter-x.svg';
import LoadingLayout from '@common/ui/layouts/LoadingLayout';
import Modal from './Modal';

const socialData = {
  facebook: {
    order: 1,
    icon: Facebook,
    url: ({ url }) => `https://www.facebook.com/sharer/sharer.php?u=${url}`,
  },
  linkedin: {
    order: 2,
    icon: LinkedIn,
    url: ({ url }) => `https://www.linkedin.com/shareArticle?url=${url}`,
  },
  twitter: {
    order: 3,
    icon: Twitter,
    url: ({ url }) => `https://twitter.com/intent/tweet/?url=${url}`,
  },
  sharable: {
    order: 4,
    icon: Link,
    url: ({ url }) => {
      copyToClipboard(url);
      cogoToast.success('Link copied to clipboard');
      return false;
    },
  },
};

function Moonshot({
  children,
  description,
  shareURI,
  title,
  ...remainingProps
}) {
  const [isOpen, setOpen] = useState(false);
  const [isReady, sharableLinks] = useMoonshotAsset(shareURI, isOpen);

  const socialClick = useSocialClick(socialData);

  const onOpen = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const triggerUI = (component) => cloneElement(component, {
    onClick: onOpen,
  });

  const modalBodyUI = () => {
    if (!isReady) {
      return (
        <LoadingLayout />
      );
    }
    return (
      <div className="column">
        <p>{description}</p>
        <div className="moonshot__image-container">
          <img src={sharableLinks.directLink} alt="moonshot__image" />
        </div>
        <div className="moonshot__footer">
          {Object.keys(socialData).map((key) => {
            const socialObj = socialData[key];
            const linkUri = sharableLinks[key];

            return (
              <div
                key={key}
                onClick={socialClick}
                role="presentation"
              >
                <img
                  src={socialObj.icon}
                  alt={key}
                  className="moonshot__footer-img"
                  name={key}
                  data-link={linkUri}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="moonshot">
      {Children.map(children, triggerUI)}
      <Modal
        title={title}
        {...remainingProps}
        isOpen={isOpen}
        onClose={onClose}
      >
        {isOpen ? modalBodyUI() : null}
      </Modal>
    </div>
  );
}

export default Moonshot;
