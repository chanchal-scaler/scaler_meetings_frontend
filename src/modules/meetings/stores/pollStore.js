import {
  action, computed, flow, makeObservable, observable, toJS,
} from 'mobx';
import forOwn from 'lodash/forOwn';
import orderBy from 'lodash/orderBy';

import { DEFAULT_DURATION } from '~meetings/utils/interactions';
import {
  isChoiceValid,
  isDescriptionValid,
  MAX_CHOICE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MIN_CHOICE_LENGTH,
  MIN_DESCRIPTION_LENGTH,
} from '~meetings/utils/poll';
import { toast } from '@common/ui/general/Toast';
import { UserAuthenticationError } from '~meetings/errors';
import meetingStore from './meetingStore';
import pollApi from '~meetings/api/poll';

// Currently does not support storing polls of multiple meetings at once
class PollStore {
  polls = null;

  /** Always an array after load; API may omit or null `templates`. */
  templates = [];

  isLoaded = false;

  isLoading = false;

  loadError = null;

  isSubmitting = false;

  submitError = null;

  choices = null;

  duration = null;

  description = '';

  type = 'radio';

  trackable = false;

  trackableType = '';

  isHQOpen = false;

  activeTab = 'create';

  isPreviewOpen = true;

  previewPollId = null;

  editingPollId = null;

  previewTemplateIndex = -1;

  constructor() {
    makeObservable(this, {
      _populateFields: action,
      activeTab: observable,
      addChoice: action.bound,
      areChoicesValid: computed,
      canRemoveChoice: computed,
      canSubmit: computed,
      choices: observable,
      description: observable,
      duration: observable,
      editingPoll: computed,
      editingPollId: observable,
      isDescriptionValid: computed,
      isHQOpen: observable,
      isLive: computed,
      isLoaded: observable,
      isLoading: observable,
      isPreviewOpen: observable,
      isSubmitting: observable,
      loadError: observable.ref,
      previewPoll: computed,
      previewPollId: observable.ref,
      pollCount: computed,
      pollList: computed,
      polls: observable.ref,
      previewTemplate: computed,
      previewTemplateIndex: observable,
      templates: observable.ref,
      removeChoice: action.bound,
      reset: action.bound,
      resetFields: action.bound,
      setActiveTab: action.bound,
      setChoice: action.bound,
      setDescription: action.bound,
      setDuration: action.bound,
      setEditingPoll: action.bound,
      setHQOpen: action.bound,
      setMultiSelect: action.bound,
      setPreviewOpen: action.bound,
      setPreviewPoll: action.bound,
      setPreviewTemplate: action.bound,
      submitError: observable.ref,
      type: observable,
      validationErrors: computed,
    });
    this.resetFields();
  }

  load = flow(function* (forceServer = false) {
    if (this.isLoading || !meetingStore.slug) {
      return;
    }

    if (!this.isLoaded || forceServer) {
      this.isLoading = true;
      this.loadError = null;

      try {
        const json = yield pollApi.getList(meetingStore.slug);
        this.polls = json.polls;
        this.templates = Array.isArray(json.templates) ? json.templates : [];
        this.isLoaded = true;
      } catch (error) {
        this.loadError = error;
      }

      this.isLoading = false;
    }
  });

  // eslint-disable-next-line require-yield
  create = flow(function* (publish = false) {
    if (this.isSubmitting || !meetingStore.slug || !this.canSubmit) {
      return;
    }

    this.isSubmitting = true;
    this.submitError = null;

    try {
      const payload = this._createPollPayload(publish);
      const {
        poll,
        published,
      } = yield pollApi.create(meetingStore.slug, payload);

      this.polls = {
        ...this.polls,
        [poll.id]: poll,
      };
      this.resetFields();
      if (published) {
        this._tryPollLaunch(poll.id);
        this.republish(poll.id);
      } else if (publish) {
        toast.show({
          message: 'Poll created but failed to launch it',
          type: 'warning',
        });
      } else {
        toast.show({ message: 'Poll created successfully' });
      }
    } catch (error) {
      if (!(error instanceof UserAuthenticationError)) {
        toast.show({
          message: 'Failed to create poll!',
          type: 'error',
        });
      }
      this.submitError = error;
    }
    this.isSubmitting = false;
  });

  publish = flow(function* (pollId) {
    if (this.isSubmitting || !meetingStore.slug) {
      return;
    }
    this.isSubmitting = true;
    this.submitError = null;

    try {
      yield pollApi.publish(meetingStore.slug, pollId);
      this._tryPollLaunch(pollId);
      this._setStatus(pollId, 'unlocked');
      toast.show({ message: 'Poll has been launched' });

      this.republish(pollId);
    } catch (error) {
      this.submitError = error;
      if (!(error instanceof UserAuthenticationError)) {
        toast.show({
          message: 'Failed to launch poll!',
          type: 'error',
        });
      }
    }
    this.isSubmitting = false;
  });

  update = flow(function* () {
    if (this.isSubmitting || !meetingStore.slug) {
      return;
    }

    this.isSubmitting = true;
    this.submitError = null;

    try {
      const payload = this._editPollPayload();
      const {
        poll,
      } = yield pollApi.update(
        meetingStore.slug,
        this.editingPollId,
        payload,
      );

      this.polls = {
        ...this.polls,
        [poll.id]: poll,
      };
      this.resetFields();
      toast.show({
        message: `${this.editingPoll.name} has been updated successfully`,
      });
      this.setPreviewPoll(this.editingPollId);
      this.setEditingPoll(null);
    } catch (error) {
      this.submitError = error;
      if (!(error instanceof UserAuthenticationError)) {
        toast.show({
          message: 'Failed to update poll!',
          type: 'error',
        });
      }
    }

    this.isSubmitting = false;
  });

  // NOTE: This republish only happens 3 seconds after,
  // and not very configurable at the moment
  republish(pollId) {
    const delayTime = 3000;
    if (!meetingStore.slug || !this.polls[pollId]) {
      return;
    }
    const { meeting } = meetingStore;
    setTimeout(() => {
      if (meeting && meeting.manager) {
        const { manager } = meeting;
        manager.publishRecentPoll(pollId);
      }
    }, delayTime);
  }

  publishTemplate(poll) {
    this._populateFields(poll);
    this.create(true);
  }

  addChoice() {
    this.choices.push('');
  }

  clonePoll(poll) {
    this._populateFields(poll);
  }

  removeChoice(choiceIndex) {
    if (!this.canRemoveChoice) {
      return;
    }

    this.choices.splice(choiceIndex, 1);
  }

  reset() {
    this.isLoaded = false;
    this.polls = null;
    this.templates = [];
    this.setEditingPoll(null);
    this.setPreviewOpen(false);
    this.setPreviewPoll(null);
    this.resetFields();
  }

  resetFields() {
    this.duration = DEFAULT_DURATION;
    this.description = '';
    this.choices = ['', ''];
    this.type = 'radio';
  }

  setActiveTab(tab) {
    this.activeTab = tab;
  }

  setChoice(value, choiceIndex) {
    this.choices = this.choices.map((choice, index) => (
      index === choiceIndex ? value : choice
    ));
  }

  setDescription(description) {
    this.description = description;
  }

  setDuration(duration) {
    this.duration = duration;
  }

  setEditingPoll(pollId) {
    this.editingPollId = pollId;

    const poll = this.pollList.find(o => o.id === pollId);
    if (poll) {
      this._populateFields(poll);
    } else {
      this.resetFields();
    }
  }

  setHQOpen(isOpen) {
    this.isHQOpen = isOpen;
  }

  setMultiSelect(isMultiSelect) {
    this.type = isMultiSelect ? 'checkbox' : 'radio';
  }

  setPreviewOpen(isOpen) {
    this.isPreviewOpen = isOpen;
  }

  setPreviewPoll(id) {
    this.previewPollId = id;
  }

  setPreviewTemplate(index) {
    this.previewTemplateIndex = index;
  }

  get areChoicesValid() {
    return this.choices.every(o => isChoiceValid(o));
  }

  // Allow to remove choice only if there are more than 2 choices
  get canRemoveChoice() {
    return this.choices.length > 2;
  }

  // Bunch of validations that check if the poll can be submitted either for
  // creation or for updation
  get canSubmit() {
    return this.validationErrors.length === 0;
  }

  get editingPoll() {
    if (this.editingPollId) {
      return this.pollList.find(o => o.id === this.editingPollId);
    } else {
      return null;
    }
  }

  get validationErrors() {
    const errors = [];

    if (!this.isDescriptionValid) {
      errors.push(
        `Problem statement should be between ${MIN_DESCRIPTION_LENGTH} and `
        + `${MAX_DESCRIPTION_LENGTH} characters length`,
      );
    }

    if (!this.areChoicesValid) {
      errors.push(
        `All choices should be between ${MIN_CHOICE_LENGTH} and `
        + `${MAX_CHOICE_LENGTH} characters length`,
      );
    }

    return errors;
  }

  get isDescriptionValid() {
    return isDescriptionValid(this.description);
  }

  // eslint-disable-next-line class-methods-use-this
  get isLive() {
    const { meeting, slug } = meetingStore;
    return (
      meeting
      && meeting.slug === slug
      && meeting.manager
      && meeting.manager.isConnected
    );
  }

  get previewPoll() {
    if (this.previewPollId) {
      return this.pollList.find(o => o.id === this.previewPollId);
    } else {
      return null;
    }
  }

  get pollCount() {
    return this.pollList.length;
  }

  get pollList() {
    const list = [];

    forOwn(this.polls, (poll) => {
      list.push(poll);
    });

    return orderBy(list, [function (listItem) {
      const requiredOrder = ['locked', 'unlocked', 'completed'];
      return requiredOrder.indexOf(listItem.status);
    }]);
  }

  get previewTemplate() {
    const { templates, previewTemplateIndex: i } = this;
    if (!templates?.length || i < 0 || i >= templates.length) {
      return undefined;
    }
    return templates[i];
  }

  get templateCount() {
    return this.templates?.length ?? 0;
  }

  /* Private */

  _createPollPayload(publish) {
    const pollNum = this.pollCount + 1;
    return {
      name: `Poll ${pollNum}`,
      publish,
      duration: this.duration,
      description: this.description,
      choices: toJS(this.choices),
      type: this.type,
      trackable: this.trackable || false,
      trackable_type: this.trackableType || '',
    };
  }

  _editPollPayload() {
    const { id, name } = this.editingPoll;
    return {
      id,
      name,
      duration: this.duration,
      description: this.description,
      choices: toJS(this.choices),
      type: this.type,
      trackable: this.trackable || false,
      trackable_type: this.trackableType || '',
    };
  }

  _populateFields(poll) {
    const {
      duration, description, choices, type, trackable = false,
      trackable_type: trackableType,
    } = poll;
    this.duration = duration;
    this.description = description;
    this.choices = toJS([...choices]);
    this.type = type || 'radio';
    this.trackable = trackable || false;
    this.trackableType = trackableType || '';
  }

  _tryPollLaunch(pollId) {
    if (this.isLive) {
      const { meeting } = meetingStore;
      const { manager, user } = meeting;
      const poll = this.pollList.find(o => o.id === pollId);
      manager.launchPoll(poll, user.user_id);
      this.setHQOpen(false);
    }
  }

  _setStatus(pollId, status) {
    const poll = this.polls[pollId];
    poll.status = status;
    this.polls = {
      ...this.polls,
      [pollId]: poll,
    };
  }
}

const pollStore = new PollStore();

export default pollStore;
