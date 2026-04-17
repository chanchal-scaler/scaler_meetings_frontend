import gtmTracking from '@common/vanilla_ui/tracking/gtm';
import EventEmitter from '@common/lib/eventEmitter';

export const modalEvents = new EventEmitter();

const openModalClass = 'sr-modal--open';
const openModalSelector = '.sr-modal.sr-modal--open';
const modalContentSelector = '.sr-modal__content';

// Assumes that at a time only one modal can be open
function handleBackdropClick(event) {
  const modalEl = document.querySelector(openModalSelector);
  if (!modalEl) return;

  const modalContentEl = modalEl.querySelector(modalContentSelector);
  if (!modalContentEl?.contains(event.target)) {
    modalEl.classList.remove(openModalClass);
    gtmTracking.sendModalOpen(modalEl.id, false);
    window.removeEventListener('click', handleBackdropClick);
    modalEvents.emit('backdrop:dismissed', modalEl.id);
  }
}

function _openModal(modalId, disableBackdrop = false) {
  const modalEl = document.getElementById(modalId);
  modalEl.classList.add(openModalClass);
  gtmTracking.sendModalOpen(modalId, true);
  const isSticky = modalEl.classList.contains('sr-modal--blocker');
  if (disableBackdrop || isSticky) {
    window.removeEventListener('click', handleBackdropClick);
  } else {
    window.addEventListener('click', handleBackdropClick);
  }
  modalEvents.emit('trigger:opened', modalId);
}

/**
 * Use this method to programatically open modal. Make sure to call
 * `event.preventDefault()` and `event.stopPropogation()` in the click handle
 * when using the method
 */
function openModal(modalId, disableBackdrop = false) {
  _openModal(modalId, disableBackdrop);
  modalEvents.emit('open', modalId);
}

function closeModal(modalId) {
  const modalEl = document.getElementById(modalId);
  modalEl.classList.remove(openModalClass);
  gtmTracking.sendModalOpen(modalEl ? modalEl.id : null, false);
  window.removeEventListener('click', handleBackdropClick);
  modalEvents.emit('trigger:dismissed', modalId);
}

function handleModalOpen(event) {
  event.preventDefault();
  event.stopPropagation();

  const modalId = this.getAttribute('data-target');
  _openModal(modalId);
}

function handleModalClose(event) {
  event.preventDefault();
  const modalId = this.getAttribute('data-target');
  closeModal(modalId);
  modalEvents.emit('dismissed', modalId);
}

function registerTriggers() {
  const modalTriggers = document.querySelectorAll('[data-action="modal-open"]');
  modalTriggers.forEach(el => {
    el.removeEventListener('click', handleModalOpen);
    el.addEventListener('click', handleModalOpen);
  });
}

function initializeModals() {
  registerTriggers();
  const modalCloseButtons = document.querySelectorAll(
    '[data-action="modal-close"]',
  );
  modalCloseButtons.forEach(
    el => el.addEventListener('click', handleModalClose, { capture: true }),
  );
}

export default {
  handleOpen: handleModalOpen,
  initialize: initializeModals,
  open: openModal,
  close: closeModal,
  registerTriggers,
};
