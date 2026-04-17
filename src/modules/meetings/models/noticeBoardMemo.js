import { computed, makeObservable } from 'mobx';

class NoticeBoardMemo {
  constructor(meeting, data) {
    this._meeting = meeting;
    this._data = data;
    makeObservable(this, {
      fromLabel: computed,
    });
  }

  get data() {
    return this._data;
  }

  get body() {
    return this.data.body;
  }

  get pinId() {
    return this.data.pinId;
  }

  get timestamp() {
    return new Date(this.data.createdAt).getTime();
  }

  get fromId() {
    return this.data.fromId;
  }

  get meeting() {
    return this._meeting;
  }

  get fromLabel() {
    if (this.meeting.userId === this.fromId) {
      return 'You';
    } else {
      return this.meeting.getParticipant(this.fromId).shortName;
    }
  }

  updateBody(body) {
    this._data.body = body;
  }
}

export default NoticeBoardMemo;
