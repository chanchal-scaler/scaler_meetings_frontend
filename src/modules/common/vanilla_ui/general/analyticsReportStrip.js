const baseClass = '.analytics-strip';
const containerClass = `${baseClass}__container`;
const closeIconClass = `${baseClass}__close-icon`;

const containerEl = document.querySelector(containerClass);
const closeIconBtn = document.querySelector(closeIconClass);

function initialize() {
  if (containerEl && closeIconBtn) {
    closeIconBtn.addEventListener('click', () => {
      containerEl.classList.add('hidden');
    });
  }
}

export default {
  initialize,
};
