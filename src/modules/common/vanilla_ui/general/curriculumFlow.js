const curriculumId = 'curriculum';
const beginnerContentId = 'Beginner';
const intermediateContentId = 'Intermediate';
const advancedContentId = 'Advanced';

const beginnerMobileContentId = 'Beginner-mobile';
const intermediateMobileContentId = 'Intermediate-mobile';
const advancedMobileContentId = 'Advanced-mobile';
const moduleCurriculumClass = `.curriculum-module__card`;
const curriculumContentClass = `.curriculum-content`;
const curriculumMobileClass = '.curriculum-mobile';
const courseCurriculumClass = `.curriculum-course__section`;
const courseClassPrefix = '.curriculum-course';
const curriculumDropdownClass = `${curriculumMobileClass}__dropdown-container`;
const nextModuleClass = `${curriculumContentClass}__read`;

const infoItems = document.querySelectorAll(
  `.${curriculumId}__course-information`,
);
const courseItems = document.querySelectorAll(courseCurriculumClass);
// eslint-disable-next-line prefer-const
let isMobileRender = false;
const checkedCircle = document.querySelectorAll(
  `${courseClassPrefix}__checked-circle`,
);
const boundaryCircle = document.querySelectorAll(`${
  courseClassPrefix}__boundary`);
const beginnerContentEl = document.getElementById(beginnerContentId);
const intermediateContentEl = document.getElementById(intermediateContentId);
const advancedContentEl = document.getElementById(advancedContentId);
const beginnerMobileContentEl = document.getElementById(
  beginnerMobileContentId,
);
const intermediateMobileContentEl = document.getElementById(
  intermediateMobileContentId,
);
const advancedMobileContentEl = document.getElementById(
  advancedMobileContentId,
);

const NUMBER_OF_COURSES = 3;

const getSiblings = function (e) {
  const siblings = [];
  if (!e.parentNode) {
    return siblings;
  }
  let sibling = e.parentNode.firstChild;
  while (sibling) {
    if (sibling.nodeType === 1 && sibling !== e) {
      siblings.push(sibling);
    }
    sibling = sibling.nextSibling;
  }
  return siblings;
};

function initializeAccordian() {
  const clickedAccordian = document.querySelectorAll('.accordion-header');
  if (clickedAccordian) {
    for (let i = 0; i < clickedAccordian.length; i += 1) {
      clickedAccordian[i].addEventListener('click', () => {
        const siblings = getSiblings(clickedAccordian[i]);
        let nextSibling;
        if (siblings.length > 1) {
          // eslint-disable-next-line prefer-destructuring
          nextSibling = siblings[1];
        } else {
          nextSibling = clickedAccordian[i].nextSibling.nextElementSibling;
        }

        nextSibling.classList.toggle('hide');
        clickedAccordian[i].children[0].classList.toggle('is-expanded');
      });
    }
  }
}

function addMobileActive(root, index) {
  const contentAllMobile = root.querySelectorAll(
    `${curriculumMobileClass}__content`,
  );
  const accordionItems = root.querySelectorAll(
    `${curriculumMobileClass}__heading`,
  );
  contentAllMobile.forEach((element, idx) => {
    if (idx === index) {
    // Handle a case where the same module is clicked again!
      element.classList.toggle('mobile-active');
    } else {
      element.classList.remove('mobile-active');
      // Close all the other accordions and open only the required one!
      if (accordionItems[idx].classList.contains('is-expanded')) {
        accordionItems[idx].click();
      }
    }
  });
}

function toggleChecks(courseIdx) {
  for (let currIdx = 0; currIdx < NUMBER_OF_COURSES; currIdx += 1) {
    if (currIdx === courseIdx) {
      checkedCircle[currIdx].classList.remove('hide');
      boundaryCircle[currIdx].classList.add('hide');
    } else {
      checkedCircle[currIdx].classList.add('hide');
      boundaryCircle[currIdx].classList.remove('hide');
    }
  }
}

function makeBeginnerActive() {
  if (isMobileRender) {
    beginnerMobileContentEl.classList.remove('hide');
    intermediateMobileContentEl.classList.add('hide');
    advancedMobileContentEl.classList.add('hide');
  } else {
    beginnerContentEl.classList.remove('hide');
    intermediateContentEl.classList.add('hide');
    advancedContentEl.classList.add('hide');
  }
}

function makeIntermediateActive() {
  if (isMobileRender) {
    beginnerMobileContentEl.classList.add('hide');
    intermediateMobileContentEl.classList.remove('hide');
    advancedMobileContentEl.classList.add('hide');
  } else {
    beginnerContentEl.classList.add('hide');
    intermediateContentEl.classList.remove('hide');
    advancedContentEl.classList.add('hide');
  }
}

function makeAdvanceActive() {
  if (isMobileRender) {
    beginnerMobileContentEl.classList.add('hide');
    intermediateMobileContentEl.classList.add('hide');
    advancedMobileContentEl.classList.remove('hide');
  } else {
    beginnerContentEl.classList.add('hide');
    intermediateContentEl.classList.add('hide');
    advancedContentEl.classList.remove('hide');
  }
}

function initializeCourses(courseIdx) {
  const activeFuncs = [
    makeBeginnerActive,
    makeIntermediateActive,
    makeAdvanceActive,
  ];

  courseItems[courseIdx].addEventListener('click', () => {
    courseItems.forEach(elem => {
      elem.classList.remove('active');
    });
    courseItems[courseIdx].classList.add('active');
    toggleChecks(courseIdx);
    activeFuncs[courseIdx]();
  });
}

function showContent(moduleItems, contentItems, root, index) {
  moduleItems.forEach(element => {
    element.classList.remove('active');
  });
  moduleItems[index].classList.add('active');
  if (isMobileRender) {
    addMobileActive(root, index);
  } else {
    contentItems.forEach(item => {
      item.classList.add('hide');
    });
    contentItems[index].classList.remove('hide');
  }
}


function initializeSectionContent(id) {
  const rootId = isMobileRender ? `${id}-mobile` : id;
  const root = document.getElementById(rootId);
  const dropdownItems = root.querySelectorAll(curriculumDropdownClass);
  const moduleItems = root.querySelectorAll(moduleCurriculumClass);
  const contentItems = root.querySelectorAll(curriculumContentClass);
  const nextContentItems = root.querySelectorAll(nextModuleClass);

  const items = isMobileRender ? dropdownItems : moduleItems;
  items.forEach((element, index) => {
    element.addEventListener('click', () => {
      showContent(moduleItems, contentItems, root, index);
    });
  });

  for (let courseIdx = 0; courseIdx < NUMBER_OF_COURSES; courseIdx += 1) {
    initializeCourses(courseIdx);
  }

  nextContentItems.forEach((element, index) => {
    element.addEventListener('click', () => {
      if (index === nextContentItems.length - 1) {
        showContent(moduleItems, contentItems, root, 0);
      } else {
        showContent(moduleItems, contentItems, root, index + 1);
      }
    });
  });

  if (isMobileRender) {
    contentItems.forEach(element => {
      element.classList.remove('hide');
    });
  }
}

function initializeContent() {
  const sectionIds = [
    beginnerContentId,
    intermediateContentId,
    advancedContentId,
  ];

  sectionIds.forEach((id) => {
    initializeSectionContent(id);
  });
}

function initialize() {
  const curriculum = document.getElementById(curriculumId);
  isMobileRender = getComputedStyle(infoItems[0]).display === 'none';

  if (curriculum) {
    initializeContent();
    initializeAccordian();
    window.addEventListener('resize', () => {
      isMobileRender = getComputedStyle(infoItems[0]).display === 'none';
      initializeContent();
    });
  }
}

export default {
  initialize,
};
