import Toastify from 'toastify-js';

import { apiRequest } from '@common/api/utils';

function initializeMailConfirmation() {
  const confirmationEmailEl = document.getElementById('emails-ct');
  const confirmMessage = 'Verification mail sent!';

  function sendConfirmationMail() {
    try {
      apiRequest(
        'POST',
        '/user/send-email-confirmation',
        {},
      );
      Toastify({
        text: confirmMessage,
        className: 'toastify-success',
      }).showToast();
      confirmationEmailEl.innerHTML = confirmMessage;
      confirmationEmailEl.classList.add('success');
      confirmationEmailEl.removeEventListener('click', sendConfirmationMail);
    } catch (error) {
      Toastify({
        text: 'Something went wrong! Refresh the page and try again',
        className: 'toastify-danger',
      }).showToast();
    }
  }

  if (confirmationEmailEl) {
    confirmationEmailEl.addEventListener('click', sendConfirmationMail);
  }
}

export default {
  initialize: initializeMailConfirmation,
};
