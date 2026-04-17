import uiManager from '@common/ui/uiManager';

function startGuide(name, options = { initialSlide: 0 }) {
  uiManager.emit(`${name}.start`, options);
}

function endGuide(name) {
  uiManager.emit(`${name}.end`);
}

export default {
  start: startGuide,
  end: endGuide,
};
