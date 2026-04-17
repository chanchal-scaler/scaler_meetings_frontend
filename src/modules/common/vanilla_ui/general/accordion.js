const openAccordionClass = 'accordion--open';
const openAccordionTriggerClass = 'is-expanded';

function toggleAccordion(event) {
  event.preventDefault();

  const accordionId = this.getAttribute('data-target');
  const accordionEl = document.getElementById(accordionId);

  const isExpanded = accordionEl.classList.contains(openAccordionClass);

  if (isExpanded) {
    // So that reverse animation works
    accordionEl.style.height = `${accordionEl.scrollHeight}px`;
    setTimeout(() => {
      accordionEl.style.height = '0px';
    }, 50);
  } else {
    accordionEl.style.height = `${accordionEl.scrollHeight}px`;

    // Make height auto after animation ends so that accordion will expand
    // automatically when content inside it expands.
    //
    // Straight forward case is when we have an accordion inside another
    // accordion.
    setTimeout(() => {
      accordionEl.style.height = 'auto';
    }, 500);
  }

  accordionEl.classList.toggle(openAccordionClass);
  this.classList.toggle(openAccordionTriggerClass);
}

function initializeAccordions() {
  const accordionTriggers = document.querySelectorAll(
    '[data-action="accordion-toggle"]',
  );
  if (accordionTriggers && accordionTriggers.length !== 0) {
    accordionTriggers.forEach(
      el => el.addEventListener('click', toggleAccordion),
    );
  }
}

export default {
  initialize: initializeAccordions,
};
