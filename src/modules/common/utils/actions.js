import { apiRequest } from '@common/api/utils';

export function redirectToUrl(element, url) {
  element.addEventListener('click', () => {
    window.location.href = url;
  });
}

export function internalRedirect(element, id) {
  element.addEventListener('click', () => {
    const scrollToEl = document.getElementById(id);
    if (scrollToEl) {
      scrollToEl.scrollIntoView();
    }
  });
}

export function apiCallOnClick(parent, element, formData) {
  element.addEventListener('click', async () => {
    const form = parent.querySelector(`#${formData.form}`);
    const response = Object.values(form).reduce(
      (formField, field) => {
        const result = formField;
        result[field.name] = field.value;
        return result;
      }, {},
    );
    // TODO If required add handling of response
    await apiRequest(
      formData.method, formData.endpoint, response,
    );
  });
}

export function openModal(element, id) {
  element.addEventListener('click', () => {
    const customModal = document.getElementById(id);
    if (customModal) {
      customModal.classList.add('sr-modal--open');
    }
  });
}
