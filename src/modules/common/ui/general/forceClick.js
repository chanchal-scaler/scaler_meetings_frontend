import trimEnd from 'lodash/trimEnd';

/* In the query params, have
  target =(id of the element which is to be clicked)
*/
const forceClick = () => {
  /*
    Remove forward slash after
    queryParams like ?abc={..something}/
    to ?abc={..something}
  */
  const queryParams = trimEnd(window.location.search, '/');
  const params = new URLSearchParams(queryParams);
  if (params.has('target')) {
    const elementId = params.get('target');
    const element = document.getElementById(elementId);

    if (element) {
      element.click();
    }
  }
};

export default forceClick;
