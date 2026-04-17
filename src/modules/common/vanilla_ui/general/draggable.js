const draggableElSelector = `[data-class="vanilla-draggable-window"]
[data-class="vanilla-draggable-item"]`;
const containerSelector = '[data-class="vanilla-draggable-window"]';

/** consider this logic
 * currentDraggableY = current Element's Y
 * netOffset = currentDraggableY - (nonDraggableY + (nonDraggableHeight/2))
 * now netOffset value become
 * more positive if currentDraggable is after non Draggables
 * more negative if currentDraggable is before non Draggables
 * now if you run this logic over every dragging of currentDraggable
 * computing netOffset for every realtime Y of currentDraggable and
 * find out first netOffset which is negative and greater than default value
 * then we insert currentDraggable before that element
 * whose offset satisfy above condition. and we change
 * defaultOffset value to new first negative offset
 * as the offset will be sorted in decreasing order,
 * successive offset wont replace default one, as all will be lesser
 * in our case every iteration of looping over non draggables
 * Default value is negative inifinity
*/

function firstElementHavingNegativeOffset(container, currentDraggableY) {
  const draggableElements = [
    ...container.querySelectorAll(`${draggableElSelector}:not(.dragging)`),
  ];

  const afterElement = draggableElements.reduce((closest, child) => {
    const { parentElement: { parentElement } } = child;
    const box = parentElement.getBoundingClientRect();
    const offsetDifference = currentDraggableY - (box.top + (box.height / 2));
    if (offsetDifference < 0 && offsetDifference > closest.offsetDifference) {
      return { offsetDifference, element: parentElement };
    } else {
      return closest;
    }
  }, { offsetDifference: Number.NEGATIVE_INFINITY }).element;
  return afterElement;
}

function trackDraggingOfElements() {
  const draggableElsContainer = document.querySelectorAll(containerSelector);
  draggableElsContainer.forEach(containerEl => {
    containerEl.addEventListener('dragover', (event) => {
      event.preventDefault();
      const insertBeforeThisElement = firstElementHavingNegativeOffset(
        containerEl, event.clientY,
      );
      const currDraggableEl = document.querySelector('.dragging');

      if (containerEl.getAttribute('data-id') === currDraggableEl.getAttribute(
        'data-id-target',
      )) {
        const { parentElement: { parentElement } } = currDraggableEl;

        if (insertBeforeThisElement === null) {
          containerEl.appendChild(parentElement);
        } else {
          containerEl.insertBefore(parentElement, insertBeforeThisElement);
        }
      }
    });
  });
}

function Draggable() {
  const draggableEls = document.querySelectorAll(draggableElSelector);

  draggableEls.forEach(element => {
    element.addEventListener('dragstart', (event) => {
      event.target.classList.add('dragging');
    });

    element.addEventListener('dragend', (event) => {
      event.target.classList.remove('dragging');
    });
  });

  trackDraggingOfElements();
}

export default { initialize: Draggable };
