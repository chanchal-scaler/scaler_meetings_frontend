import {
  action, computed, makeObservable, observable,
} from 'mobx';

class NudgeStore {
  currentNudge = null;

  constructor() {
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

const nudgeStore = new NudgeStore();

export default nudgeStore;
