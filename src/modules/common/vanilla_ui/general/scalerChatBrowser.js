const listItems = document.querySelectorAll('.scaler-chat__list-item');
const browserBody = document.querySelectorAll('.scaler-chat__body');
let activeItem = 1;

function scrollChatImage(i) {
  listItems.forEach(elem => {
    elem.classList.remove('active');
  });
  listItems[i].classList.add('active');
  const imageItems = document.querySelectorAll('.scaler-chat__image');
  imageItems.forEach(elem => {
    elem.classList.remove('active');
  });
  imageItems[i].classList.add('active');
  activeItem = i;
}

function initialize() {
  let scalerChatScrollInterval = setInterval(() => {
    const nextItem = activeItem === listItems.length - 1
      ? 0 : activeItem + 1;
    scrollChatImage(nextItem);
  }, 3000);

  listItems.forEach((el, i) => {
    el.addEventListener('click', () => {
      setTimeout(() => { scrollChatImage(i); }, 500);
    });
  });

  browserBody[0].addEventListener('mouseenter', () => {
    clearInterval(scalerChatScrollInterval);
  });

  browserBody[0].addEventListener('mouseleave', () => {
    scalerChatScrollInterval = setInterval(() => {
      const nextItem = activeItem === listItems.length - 1
        ? 0 : activeItem + 1;
      scrollChatImage(nextItem);
    }, 3000);
  });
}

export default {
  initialize,
};
