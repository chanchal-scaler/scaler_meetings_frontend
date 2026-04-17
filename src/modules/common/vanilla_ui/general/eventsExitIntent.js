import Modal, { modalEvents } from '@common/vanilla_ui/general/modal';
import { isMobile } from '@common/utils/responsive';

const MODAL_ID = 'events-exit-intent-modal';
const modalElement = document.getElementById(MODAL_ID);

// Checks the session storage for modal visibility
function shouldShowModal() {
  return !sessionStorage.getItem(MODAL_ID);
}

// Should Trigger the exit intent modal
function shouldTriggerModal(event) {
  return !event.toElement && !event.relatedTarget && event.clientY < 10;
}

function setModalShown() {
  sessionStorage.setItem(MODAL_ID, 'true');
}

function focusOutHandler(event) {
  if (shouldTriggerModal(event)) {
    document.removeEventListener('mouseout', focusOutHandler);
    Modal.open(MODAL_ID, true);
  }
}

/**
 * Checks if the modal should be shown and if conditions are met
 * triggers the modal on mobile devices after a delay of 15 seconds.
 */
function triggerMobileModalAfterDelay() {
  setTimeout(() => {
    Modal.open(MODAL_ID, true);
    setModalShown();
  }, 60_000); // 60 seconds
}

function handleModalOpen(id) {
  if (id === MODAL_ID) {
    setModalShown();
    window?.GTMtracker.pushEvent({
      event: 'gtm_section_view',
      data: {
        section_name: 'events-exit-intent',
      },
      action: 'section_view',
    });
  }
}

function handleModalClose(id) {
  if (id === MODAL_ID) {
    Modal.close(MODAL_ID);
    setModalShown();
  }
}

function initListeners() {
  if (isMobile()) {
    triggerMobileModalAfterDelay();
  } else {
    document.addEventListener('mouseout', focusOutHandler);
  }
}

// Track Modal events
function setupModalEvents() {
  modalEvents.on('open', handleModalOpen);
  modalEvents.on('dismissed', handleModalClose);
}

function ExitIntentInit() {
  // To init check if the user is eligible to show the modal
  if (modalElement && shouldShowModal()) {
    initListeners();
    setupModalEvents();
  }
}

export default { initialize: ExitIntentInit };
