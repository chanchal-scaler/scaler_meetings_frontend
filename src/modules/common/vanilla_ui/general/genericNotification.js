import genericNotification from './generic_notifications/socket';

function initialize() {
  window.addEventListener('load', () => {
    genericNotification();
    const rootElement = document.createElement('div');
    rootElement.classList.add('nudges-notification');
    rootElement.setAttribute('id', 'nudgeNotification');
    document.body.appendChild(rootElement);
    window.__NOTIFICATION__ = 1;
  }, false);
}

window.displayNotification = function (
  className, data, notificationTime = 10000,
) {
  const nudgeNotification = document.getElementById('nudgeNotification');
  const notificationId = Math.round(Math.random() * 100000);
  const {
    header, subheader, desc, link, linkHref, closable, icon,
  } = data;

  const notificationIcon = `
    <div class="nudge-notification__icon"> <img src="${icon}"> </div>
  `;

  const notificationSubheader = `
    <div class="nudge-notification__sub-header"> ${subheader} </div>
  `;

  const notificationDesc = `
    <div class="nudge-notification__desc"> ${desc} </div>
  `;

  const notificationLink = `
    <a class="nudge-notification__link" href= ${linkHref} target="_blank">
      ${link}
    </a>
  `;

  const markupNotification = `
    ${icon ? notificationIcon : ''}
    <div class="nudge-notification__desc">
      <div class="nudge-notification__header">
        ${header}
      </div>
      ${subheader ? notificationSubheader : ''}
      ${desc ? notificationDesc : ''}
      ${link ? notificationLink : ''}
    </div>
    <button class="nudge-notification__dismiss"  id="close">
      <span>x</span>
    </button>
  `;

  const notificationParentElement = document.createElement('a');
  notificationParentElement.classList.add('nudge-notification', 'fade-in-up');
  notificationParentElement.innerHTML = markupNotification;
  notificationParentElement.setAttribute('id', `nn${notificationId}`);
  notificationParentElement.onclick = `
    window.trackGaEvent('Notification', 'click', header)
  `;
  if (linkHref) {
    notificationParentElement.setAttribute('href', linkHref);
    notificationParentElement.setAttribute('target', '_blank');
  }

  nudgeNotification.classList.add(`nudge-notification--${className}`);
  nudgeNotification.appendChild(notificationParentElement);

  if (closable === 'true' || closable === undefined) {
    setTimeout(() => {
      if (document.getElementById(`nn${notificationId}`)) {
        nudgeNotification.removeChild(notificationParentElement);
      }
    }, notificationTime);
  }

  nudgeNotification.addEventListener('click', event => {
    window.trackGaEvent('Notification-generic', 'click', 'Notification');
    if (event.target.id === 'close' || event.target.parentNode.id) {
      event.preventDefault();

      const { target } = event;
      const notificationEl = target.closest('.nudge-notification');
      notificationEl?.remove();
    }
  });
};

export default {
  initialize,
};
