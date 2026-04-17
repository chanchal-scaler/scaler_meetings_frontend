import {
  action, computed, makeObservable, observable,
} from 'mobx';

class Nudge {
  currentNudge = null;

  constructor() {
    this.currentNudge = null;
    makeObservable(this, {
      currentNudge: observable,
      nudgeData: computed,
      setCurrentNudge: action,
      removeCurrentNudge: action,
    });
  }

  setCurrentNudge(data) {
    this.currentNudge = data;
  }

  removeCurrentNudge() {
    this.currentNudge = null;
  }

  get nudgeData() {
    return this.currentNudge;
  }
}

export default Nudge;
