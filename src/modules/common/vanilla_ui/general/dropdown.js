const nestedDropdownOptionsContainer = 'sr-nested-dropdown';
const dropdownTriggerClass = 'sr-dropdown-trigger';
const openDropdownTriggerClass = 'sr-dropdown-trigger--active';
const openDropdownClass = 'sr-dropdown--open';
const openDropdownOverlayClass = 'sr-dropdown-backdrop--active';
const openAnimationClass = 'drop-in-forward';
const closeAnimationClass = 'drop-in-reverse';
const noScrollClass = 'no-scroll';

function isDropdownOpen(el) {
  return el.classList.contains(openDropdownClass);
}

// closes the opened dropdown belonging to a dropdownFamily
function closeOpenDropdown(dropdownFamily) {
  if (!dropdownFamily) return;

  const activeTrigger = document.querySelector(
    // eslint-disable-next-line max-len
    `.${dropdownTriggerClass}.${openDropdownTriggerClass}[data-dropdown-family=${dropdownFamily}]`,
  );

  if (activeTrigger) {
    const dropdownId = activeTrigger.getAttribute('data-target');
    const dropdownEl = document.getElementById(dropdownId);

    activeTrigger.classList.remove(openDropdownTriggerClass);
    dropdownEl.classList.remove(openDropdownClass, openAnimationClass);
    dropdownEl.classList.add(closeAnimationClass);
  }
}

function handleDropdownToggle(event) {
  event.stopPropagation();
  event.preventDefault();

  const triggerEl = this;
  const dropdownId = this.getAttribute('data-target');
  const dropdownFamily = this.getAttribute('data-dropdown-family');
  const dropdownPadding = this.dataset.dropDownPadding
    ? Number(this.dataset.dropDownPadding) : 10;
  const dropdownEl = document.getElementById(dropdownId);
  const dropdownOverlayEl = document.getElementById(`${dropdownId}-backdrop`);
  const dropdownAlignment = dropdownEl.getAttribute('data-alignment');

  function closeDropdown(nativeEvent) {
    if (nativeEvent && dropdownEl.contains(nativeEvent.target)
        && dropdownEl.classList.contains(nestedDropdownOptionsContainer)
    ) {
      return;
    }
    dropdownEl.classList.remove(openDropdownClass, openAnimationClass);
    dropdownEl.classList.add(closeAnimationClass);
    document.documentElement.classList.remove(noScrollClass);
    triggerEl.classList.remove(openDropdownTriggerClass);

    if (dropdownOverlayEl) {
      dropdownOverlayEl.classList.remove(openDropdownOverlayClass);
    }

    window.removeEventListener('click', closeDropdown);
  }

  function openDropdown() {
    const {
      bottom, right, left, width,
    } = triggerEl.getBoundingClientRect();
    dropdownEl.style.top = `${bottom + dropdownPadding}px`;
    dropdownEl.style.minWidth = `${triggerEl.offsetWidth}px`;
    dropdownEl.classList.remove(closeAnimationClass);
    dropdownEl.classList.add(openDropdownClass, openAnimationClass);
    document.documentElement.classList.add(noScrollClass);
    triggerEl.classList.add(openDropdownTriggerClass);

    if (dropdownOverlayEl) {
      dropdownOverlayEl.classList.add(openDropdownOverlayClass);
    }

    const { width: dropdownWidth } = dropdownEl.getBoundingClientRect();

    switch (dropdownAlignment) {
      case 'left':
        dropdownEl.style.left = `${left}px`;
        dropdownEl.style.right = 'auto';
        break;
      case 'right':
        dropdownEl.style.left = 'auto';
        dropdownEl.style.right = `${window.innerWidth - right}px`;
        break;
      default:
        dropdownEl.style.left = `${left + (width / 2) - (dropdownWidth / 2)}px`;
        dropdownEl.style.right = 'auto';
    }

    window.addEventListener('click', closeDropdown);
  }

  if (isDropdownOpen(dropdownEl)) {
    closeDropdown();
  } else {
    closeOpenDropdown(dropdownFamily);
    openDropdown(dropdownEl, this);
  }
}

function initializedDropdown() {
  const dropdownTriggers = document.querySelectorAll(
    `.${dropdownTriggerClass}[data-action="dropdown-toggle"]`,
  );

  dropdownTriggers.forEach(
    trigger => trigger.addEventListener('click', handleDropdownToggle),
  );
}

export default {
  initialize: initializedDropdown,
};
