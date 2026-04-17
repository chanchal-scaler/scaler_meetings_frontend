import {
  action, computed, makeObservable, observable,
} from 'mobx';

import {
  FIXED_SCREEN_LAYOUT_MODES,
  LayoutModes,
} from '~meetings/utils/layout';

class LayoutStore {
  mode = LayoutModes.standalone;

  isWidgetFullscreen = false;

  isWidget = false;

  constructor() {
    makeObservable(this, {
      mode: observable,
      isRecording: computed,
      isStandalone: computed,
      isWidget: observable,
      setIsWidget: action.bound,
      isWidgetSmall: computed,
      isWidgetFullscreen: observable,
      setMode: action,
      setWidgetFullscreen: action,
    });
  }

  /* Public getters/methods */

  setMode(mode) {
    this.mode = mode;
  }

  setWidgetFullscreen(isFullscreen) {
    this.isWidgetFullscreen = isFullscreen;
  }

  setIsWidget(isWidget) {
    this.isWidget = isWidget;
  }

  get isPortrait() {
    return this.mode === LayoutModes.portrait;
  }

  get isStandalone() {
    return this.mode === LayoutModes.standalone;
  }

  get isRecording() {
    return this.mode === LayoutModes.recording;
  }

  get isWidgetSmall() {
    return this.mode === LayoutModes.widgetSmall;
  }

  get isScreenMaximiseAllowed() {
    return !FIXED_SCREEN_LAYOUT_MODES.includes(this.mode);
  }
}

const layoutStore = new LayoutStore();

export default layoutStore;
