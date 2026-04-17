const curriculumButtonClass = '.curriculum__course-button';
const bookmarkSelectorClass = '.curriculum__pointer-mark > .bookmark-icon';
const specialBookmarkClass = '.curriculum__special-mark > .bookmark-icon';
const curriculumSelectors = document.querySelectorAll(curriculumButtonClass);
const curriculumInfo = document.querySelectorAll('.curriculum__course-details');
const curriculumPointers = document.querySelectorAll('.curriculum__pointer');
const toggleInputs = document.querySelectorAll('.toggle-checkbox');
const bookmarks = document.querySelectorAll(bookmarkSelectorClass);
const specialBookmarks = document.querySelectorAll(specialBookmarkClass);

const toggleCurriculum = (index) => function toggleClasses() {
  let counter = 1;
  curriculumSelectors.forEach(selEl => {
    selEl.classList.remove('active');
  });
  curriculumSelectors[index].classList.add('active');
  curriculumInfo.forEach(infoEl => {
    infoEl.classList.remove('active');
  });
  curriculumInfo[index].classList.add('active');
  curriculumPointers.forEach((el, elIndex) => {
    if (elIndex >= index) {
      el.classList.add('active');
      bookmarks[elIndex].innerHTML = `${counter}`;
      counter += 1;
    } else {
      el.classList.remove('active');
      bookmarks[elIndex].innerHTML = '';
    }
  });
  specialBookmarks[0].innerHTML = `${counter}a`;
  specialBookmarks[1].innerHTML = `${counter}b`;
  toggleInputs.forEach(toggleEl => {
    // eslint-disable-next-line no-param-reassign
    toggleEl.checked = false;
  });
  toggleInputs[index].checked = true;
  document.querySelectorAll('.curriculum__seal').forEach(el => {
    // eslint-disable-next-line no-param-reassign
    el.style.display = 'none';
  });
  if (index === 1) {
    document.querySelectorAll('.seal-intermediate').forEach(el => {
      // eslint-disable-next-line no-param-reassign
      el.style.display = 'block';
    });
  } else if (index === 2) {
    document.querySelectorAll('.seal-advanced-1').forEach(el => {
      // eslint-disable-next-line no-param-reassign
      el.style.display = 'block';
    });
    document.querySelectorAll('.seal-advanced-2').forEach(el => {
      // eslint-disable-next-line no-param-reassign
      el.style.display = 'block';
    });
  }
  window.trackGaEvent(
    'academy-landing-page', 'curriculum', `change-curriculum-${index}`,
  );
};

function initialize() {
  curriculumSelectors.forEach((el, index) => {
    el.addEventListener('click', toggleCurriculum(index));
  });
  curriculumInfo.forEach((el, index) => {
    el.addEventListener('click', toggleCurriculum(index));
  });
}

export default {
  initialize,
};
