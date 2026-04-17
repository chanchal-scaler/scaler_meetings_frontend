import {
  action, computed, flow, makeObservable, observable,
} from 'mobx';
import { toast } from '@common/ui/general/Toast';
import { PROXY_QUESTION_MODAL_STATES } from '~meetings/utils/constants';
import proxyQuestionApi from '~meetings/api/proxyQuestion';

class ProxyQuestion {
  formOpen = false;

  isFetchingUserName = false;

  isSendingQuestion = false;

  question = '';

  userName = '';

  modalState = PROXY_QUESTION_MODAL_STATES.genericQuestion;

  constructor(meeting) {
    this._meeting = meeting;
    makeObservable(this, {
      formOpen: observable,
      question: observable,
      toggleFormOpen: action.bound,
      modalState: observable,
      fetchUserName: action.bound,
      isFetchingUserName: observable,
      isSendingQuestion: observable,
      meeting: computed,
      userName: observable,
      sendProxyQuestion: action.bound,
      setModalState: action.bound,
    });
  }

  fetchUserName = flow(function* () {
    if (this.isFetchingUserName) return;

    this.isFetchingUserName = true;
    try {
      const { data } = yield proxyQuestionApi.getRandomName();
      this.setUserName(data);
    } catch (error) {
      toast.show({
        message: error?.responseJson?.message || 'Error fetching username',
        type: 'error',
      });
    }
    this.isFetchingUserName = false;
  });

  sendProxyQuestion = flow(function* () {
    if (this.isSendingDisabled) return;

    this.isSendingQuestion = true;

    try {
      yield proxyQuestionApi.createQuestion(
        this.meeting.slug,
        this.userName,
        this.question,
      );

      toast.show({ message: 'Question created!', type: 'success' });
      this.toggleFormOpen();
    } catch (error) {
      toast.show({
        message: error?.responseJson?.message || 'Error creating question',
        type: 'error',
      });
    }

    this.isSendingQuestion = false;
  });

  setModalState(value) {
    this.modalState = value;
  }

  setUserName(userName) {
    this.userName = userName;
  }

  setQuestion(question) {
    this.question = question;
  }

  toggleFormOpen(state = PROXY_QUESTION_MODAL_STATES.genericQuestion) {
    this.formOpen = !this.formOpen;
    this.setModalState(state);
  }

  get isSendingDisabled() {
    return !this.userName || !this.question || this.isSendingQuestion;
  }

  get meeting() {
    return this._meeting;
  }
}

export default ProxyQuestion;
