import Modal from './modal';
import EventEmitter from '@common/lib/eventEmitter';

export const welcomeModalEvents = new EventEmitter();

function openWelcomeModal() {
  const modalId = 'academy-welcome';
  const modalElem = document.getElementById(modalId);

  if (!modalElem) {
    return;
  }

  Modal.open(modalId, true);
}

function initializeWelcomeModal() {
  welcomeModalEvents.on('show', openWelcomeModal);
}

export default { initialize: initializeWelcomeModal };
