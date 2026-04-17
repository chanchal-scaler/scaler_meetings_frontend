import { copyToClipboard } from '@common/utils/misc';
import { log } from '@common/utils/debug';
import Modal from './modal';
import { isScalerMobileApp } from '@common/utils/platform';
import { notifyWebview } from '@common/utils/webview';

const shareModalId = 'share-modal';
const shareLinkCopiedClass = 'sr-share__copy-button--copied';
const shareItemSelector = '.sr-share__item';
const shareLinkSelector = '.sr-share__link';
const shareCopyButtonSelector = '.sr-share__copy-button';
const nativeShareEvent = 'shareMessage';

const _nativeShare = async (message, link) => {
  if (isScalerMobileApp()) {
    await notifyWebview(
      nativeShareEvent,
      `${message}\n Check out this link: ${link}`,
    );
  } else {
    await window.navigator.share({
      text: message,
      url: link,
    });
  }
};

function generateShareLink(medium, shareLink, shareMessage) {
  let link;
  const encodedShareLink = encodeURIComponent(shareLink);
  switch (medium) {
    case 'whatsapp':
      link = `https://wa.me/?text=${shareMessage}. ${encodedShareLink}`;
      break;
    case 'facebook':
      link = `https://www.facebook.com/sharer/sharer.php?u=${encodedShareLink}`;
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
    default:
      log('Unknown share medium', medium);
  }
  return link;
}

function updateShareLinks(modalEl, link, message) {
  const linkEls = modalEl.querySelectorAll(shareItemSelector);
  linkEls.forEach(el => {
    const medium = el.getAttribute('data-medium');
    const mediumLink = generateShareLink(medium, link, message);
    el.setAttribute('href', mediumLink);
  });
}

function updateCopyLink(modalEl, link) {
  const linkEl = modalEl.querySelector(shareLinkSelector);
  const copyButtonEl = modalEl.querySelector(shareCopyButtonSelector);

  linkEl.setAttribute('data-link', link);
  linkEl.innerHTML = link;
  copyButtonEl.innerHTML = 'COPY';
  copyButtonEl.classList.remove(shareLinkCopiedClass);
}

function handleShareModalOpen(event, target = 'currentTarget') {
  const triggerEl = event[target];
  const modalEl = document.getElementById(shareModalId);
  const link = triggerEl.getAttribute('data-link');
  const message = triggerEl.getAttribute('data-message');

  updateShareLinks(modalEl, link, message);
  updateCopyLink(modalEl, link);

  Modal.handleOpen.call(triggerEl, event);
}

async function handleShare(event, target = 'currentTarget') {
  const nativeShareAvailable = isScalerMobileApp() || window.navigator.share;
  if (nativeShareAvailable) {
    const triggerEl = event[target];
    const link = triggerEl.getAttribute('data-link');
    const message = triggerEl.getAttribute('data-message');
    try {
      await _nativeShare(message, link);
    } catch (error) {
      // eslint-disable-next-line
      console.error('Error while sharing. Please try again');
    }
  } else {
    handleShareModalOpen(event, target);
  }
}

function handleLinkCopy() {
  const modalEl = document.getElementById(shareModalId);
  const shareCopyButtonEl = modalEl.querySelector(shareCopyButtonSelector);
  if (!shareCopyButtonEl.classList.contains(shareLinkCopiedClass)) {
    const shareLinkEl = document.querySelector(shareLinkSelector);
    const link = shareLinkEl.getAttribute('data-link');
    copyToClipboard(link);
    shareCopyButtonEl.classList.add(shareLinkCopiedClass);
    shareCopyButtonEl.innerHTML = 'Copied';
  }
}

function registerTriggers() {
  const shareModalEl = document.getElementById(shareModalId);
  const copyButtonEl = shareModalEl.querySelector(shareCopyButtonSelector);
  copyButtonEl.addEventListener('click', handleLinkCopy);

  const shareTriggers = document.querySelectorAll(
    `.share-trigger[data-action="share-open"]`,
  );
  shareTriggers.forEach(el => el.addEventListener('click', handleShare));
}


function initializeShare() {
  registerTriggers();
}

export default {
  initialize: initializeShare,
  handleShare,
  handleLinkCopy,
};
