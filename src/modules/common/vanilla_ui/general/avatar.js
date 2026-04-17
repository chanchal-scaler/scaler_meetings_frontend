function handleAvatarLoad(el) {
  const containerEl = el.parentElement;
  const imgSrc = el.getAttribute('data-src');

  const image = new Image();

  image.onload = () => {
    // eslint-disable-next-line
    el.src = imgSrc;
    containerEl.classList.add('avatar--loaded');
  };

  image.onerror = () => {
    containerEl.classList.add('avatar--error');
  };

  image.src = imgSrc;
}

function initializeAvatars() {
  const avatarEls = document.querySelectorAll(`img[data-image="avatar"]`);
  avatarEls.forEach(handleAvatarLoad);
}

export default {
  initialize: initializeAvatars,
};
