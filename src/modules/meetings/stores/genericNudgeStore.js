import {
  action, computed, makeObservable, observable,
} from 'mobx';

class GenericNudgeStore {
  currentNudge = null;

  constructor() {
    makeObservable(this, {
      currentNudge: observable,
      nudgeData: computed,
      setCurrentNudge: action,
      removeCurrentNudge: action,
    });
  }

  setCurrentNudge(nudge) {
    this.currentNudge = nudge;
  }

  removeCurrentNudge() {
    this.currentNudge = null;
  }

  get nudgeData() {
    return this.currentNudge;
  }
}

const genericNudgeStore = new GenericNudgeStore();

export default genericNudgeStore;
