const observerConfig = {
  root: null,
  rootMargin: '0px',
  threshold: 0,
};
const rcbModal = document.getElementById('request-callback-container');
const elementNodes = [];

const addNodeElements = (elements) => {
  elements.forEach(ele => {
    const nodeEle = document.querySelector(ele);
    if (nodeEle) {
      elementNodes.push(nodeEle);
    }
  });
};

const disableRcb = (entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      elementNodes.forEach(eleNode => {
        eleNode.classList.add('overlay-effect');
      });
    } else {
      elementNodes.forEach(eleNode => {
        eleNode.classList.remove('overlay-effect');
      });
    }
  });
};

function initialize({
  elements = [],
}) {
  addNodeElements(elements);
  if (rcbModal) {
    const observer = new IntersectionObserver(disableRcb, observerConfig);
    observer.observe(rcbModal);
  }
}

export default {
  initialize,
};
