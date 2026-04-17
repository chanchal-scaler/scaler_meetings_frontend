import {
  action, computed, flow, makeObservable, observable, toJS,
} from 'mobx';
import findIndex from 'lodash/findIndex';
import forOwn from 'lodash/forOwn';
import orderBy from 'lodash/orderBy';

import {
  ActionTypes,
  DEFAULT_CHOICE,
  DEFAULT_CHOICES,
  DEFAULT_DURATION,
  isChoiceValid,
  isDescriptionValid,
  containsSpecialCharacters,
  MAX_CHOICE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MIN_CHOICE_LENGTH,
  MIN_DESCRIPTION_LENGTH,
  transformQuizData,
  QUIZZES_PER_PAGE,
} from '~meetings/utils/quiz';
import { toast } from '@common/ui/general/Toast';
import { UserAuthenticationError } from '~meetings/errors';
import meetingStore from './meetingStore';
import quizApi from '~meetings/api/quiz';

class QuizStore {
  // Problems and quizzes will contain published quizzes.
  // This is done to provide backwards compatibility with
  // the existing code.
  quizzes = null;

  problems = null;

  isLoaded = false;

  isLoading = false;

  loadError = null;

  isSubmitting = false;

  isSaving = false;

  submitError = null;

  saveError = null;

  choices = null;

  duration = null;

  description = '';

  isHQOpen = false;

  activeTab = 'create';

  isPreviewOpen = true;

  // previewQuizId = null;

  previewProblemId = null;

  editingQuizId = null;

  searchQuery = '';

  selectedTopic = '';

  selectedInstructor = '';

  isLoadingAll = false;

  isLoadedAll = false;

  loadErrorAll = null;

  problemsAll = [];

  isLoadingSaved = false;

  isLoadedSaved = false;

  loadErrorSaved = false;

  problemsSaved = [];

  isLoadingLaunched = false;

  isLoadedLaunched = false;

  loadErrorLaunched = null

  problemsLaunched = [];

  meta = null;

  allPage = 1;

  savedPage = 1;

  hasMoreAll = true;

  hasMoreSaved = true;

  constructor() {
    makeObservable(this, {
      _populateFields: action,
      activeTab: observable,
      addChoice: action.bound,
      areChoicesValid: computed,
      canRemoveChoice: computed,
      canSubmit: computed,
      choices: observable,
      correctChoiceIndex: computed,
      description: observable,
      searchQuery: observable,
      allPage: observable,
      hasMoreAll: observable,
      hasMoreSaved: observable,
      savedPage: observable,
      selectedTopic: observable,
      selectedInstructor: observable,
      duration: observable,
      editingQuiz: computed,
      editingQuizId: observable,
      isCorrectAnswerMarked: computed,
      isDescriptionValid: computed,
      isHQOpen: observable,
      isLive: computed,
      isLoaded: observable,
      isLoading: observable,
      isLoadedAll: observable,
      isLoadingAll: observable,
      isLoadedLaunched: observable,
      isLoadingLaunched: observable,
      isLoadedSaved: observable,
      isLoadingSaved: observable,
      isPreviewOpen: observable,
      isSubmitting: observable,
      isSaving: observable,
      loadError: observable.ref,
      loadErrorAll: observable.ref,
      loadErrorLaunched: observable.ref,
      loadErrorSaved: observable.ref,
      launchedProblemCount: computed,
      markChoiceAsCorrect: action.bound,
      meta: observable,
      previewQuiz: computed,
      previewProblemId: observable.ref,
      problems: observable.ref,
      problemsAll: observable.ref,
      problemsLaunched: observable.ref,
      problemsSaved: observable.ref,
      quizCount: computed,
      allProblemCount: computed,
      savedProblemCount: computed,
      quizList: computed,
      quizzes: observable.ref,
      loadMeta: action.bound,
      removeChoice: action.bound,
      reset: action.bound,
      resetFields: action.bound,
      setActiveTab: action.bound,
      setChoice: action.bound,
      setDescription: action.bound,
      setSearchQuery: action.bound,
      setSelectedTopic: action.bound,
      nextPage: action.bound,
      setSelectedInstructor: action.bound,
      setDuration: action.bound,
      setEditingQuiz: action.bound,
      setHQOpen: action.bound,
      setPreviewOpen: action.bound,
      setPreviewQuiz: action.bound,
      submitError: observable.ref,
      validationErrors: computed,
      saveError: observable.ref,
    });
    this.resetFields();
  }

  loadMeta = flow(function* () {
    try {
      const meta = yield quizApi.meta(meetingStore.slug);
      this.meta = meta;
    } catch (error) {
      // Do nothing since this isnt UI breaking
    }
  })

  loadAll = flow(function* (
    params = { forceServer: false, filterChange: false },
  ) {
    const { forceServer, filterChange } = params;

    if (this.isLoadingAll || !meetingStore.slug) {
      return;
    }

    if (forceServer || !this.isLoadedAll) {
      this.isLoadingAll = true;
      this.loadErrorAll = null;

      try {
        const {
          quiz_problems: quizProblems,
        } = yield quizApi.getAllList(meetingStore.slug, {
          topic_name: encodeURIComponent(this.selectedTopic),
          instructor_name: encodeURIComponent(this.selectedInstructor),
          search_query: encodeURIComponent(this.searchQuery),
          page: this.allPage,
        });

        const list = [];
        quizProblems.forEach((problem) => list.push(problem));

        if (filterChange) {
          this.problemsAll = list;
        } else {
          this.problemsAll = [...this.problemsAll, ...list];
        }

        this.hasMoreAll = list.length === QUIZZES_PER_PAGE;
        this.isLoadedAll = true;
      } catch (error) {
        this.loadErrorAll = error;
      }

      this.isLoadingAll = false;
    }
  });

  loadSaved = flow(function* (params = { forceServer: false }) {
    const { forceServer } = params;

    if (this.isLoadingSaved || !meetingStore.slug) {
      return;
    }

    if (forceServer || !this.isLoadedSaved) {
      this.isLoadingSaved = true;
      this.loadErrorSaved = null;

      try {
        const {
          bookmarks,
        } = yield quizApi.getSavedList(meetingStore.slug, {
          page: this.savedPage,
        });

        this.problemsSaved = [...this.problemsSaved, ...bookmarks];

        this.hasMoreSaved = bookmarks.length === QUIZZES_PER_PAGE;
        this.isLoadedSaved = true;
      } catch (error) {
        this.loadErrorSaved = error;
      }

      this.isLoadingSaved = false;
    }
  });

  loadLaunched = flow(function* (params = { forceServer: false }) {
    const { forceServer } = params;

    if (this.isLoadingLaunched || !meetingStore.slug) {
      return;
    }

    if (forceServer || !this.isLoadedLaunched) {
      this.isLoadingLaunched = true;
      this.loadErrorLaunched = null;

      try {
        const {
          launched: launchedProblems,
        } = yield quizApi.getLaunchedList(meetingStore.slug);

        this.problemsLaunched = [...this.problemsLaunched, ...launchedProblems];

        this.isLoadedLaunched = true;
      } catch (error) {
        this.loadErrorLaunched = error;
      }

      this.isLoadingLaunched = false;
    }
  });

  create = flow(function* (publish = false) {
    if (this.isSubmitting || !meetingStore.slug || !this.canSubmit) {
      return;
    }
    const { participant } = meetingStore;
    const { name } = participant;

    this.isSubmitting = true;
    this.submitError = null;

    try {
      const payload = this._createQuizPayload(publish);
      const {
        quiz,
        quiz_problems: quizProblems,
        published,
      } = yield quizApi.create(meetingStore.slug, payload);

      let isLaunched = false;
      this.resetFields();

      if (published) {
        this.problems = {
          ...this.problems,
          ...quizProblems,
        };
        this.quizzes = {
          ...this.quizzes,
          [quiz.id]: quiz,
        };
        this._tryQuizLaunch(quiz.id);
        this.republish(quiz.id);
        isLaunched = true;
      } else if (publish) {
        toast.show({
          message: 'Quiz created but failed to launch it',
          type: 'warning',
        });
        isLaunched = false;
      } else {
        toast.show({ message: 'Quiz created successfully' });
      }

      this.meta.all_problems_count += 1;

      if (this.isLoadedAll || this.isLoadedLaunched) {
        const newProblem = this._createNewProblem(
          quiz, quizProblems, isLaunched, name,
        );
        if (this.isLoadedAll) {
          this.problemsAll = [
            newProblem,
            ...this.problemsAll,
          ];
        }
        if (isLaunched && this.isLoadedLaunched) {
          this.problemsLaunched = [
            newProblem,
            ...this.problemsLaunched,
          ];
        }
      }
    } catch (error) {
      if (!(error instanceof UserAuthenticationError)) {
        toast.show({
          message: 'Failed to create quiz!',
          type: 'error',
        });
      }
      this.submitError = error;
    }

    this.isSubmitting = false;
    this.track(ActionTypes.CREATE_NEW_PROBLEM);
  });

  publish = flow(function* (problemId) {
    if (this.isSubmitting || !meetingStore.slug) {
      return;
    }

    this.isSubmitting = true;
    this.submitError = null;
    const problem = this.getProblemById(problemId);

    try {
      const {
        quiz,
        quiz_problems: quizProblems,
      } = yield quizApi.publish(
        meetingStore.slug,
        problemId,
        { duration: problem.duration },
      );

      this.problems = {
        ...this.problems,
        ...quizProblems,
      };
      this.quizzes = {
        ...this.quizzes,
        [quiz.id]: quiz,
      };

      this._tryQuizLaunch(quiz.id);
      this._setStatus(quiz.id, 'unlocked');
      toast.show({ message: 'Quiz has been launched' });

      if (this.isLoadedAll) {
        this.problemsAll = this.problemsAll.map((prblm) => {
          if (prblm.id === problemId) {
            return { ...prblm, is_launched: true };
          }
          return prblm;
        });
      }
      if (this.isLoadedSaved) {
        this.problemsSaved = this.problemsSaved.map((prblm) => {
          if (prblm.id === problemId) {
            return { ...prblm, is_launched: true };
          }
          return prblm;
        });
      }
      if (this.isLoadedLaunched) {
        const newLaunchedProblem = this.getProblemById(problemId);
        newLaunchedProblem.is_launched = 1;
        this.problemsLaunched = [newLaunchedProblem, ...this.problemsLaunched];
      }

      if (problem.in_current_meeting) {
        this.track(ActionTypes.USE_OLD_PROBLEM);
      }
      this.republish(quiz.id);
    } catch (error) {
      this.submitError = error;
      if (!(error instanceof UserAuthenticationError)) {
        toast.show({
          message: 'Failed to launch quiz!',
          type: 'error',
        });
      }
    }

    this.isSubmitting = false;
  });


  saveProblem = flow(function* (problemId) {
    if (!meetingStore.slug) {
      return;
    }
    this.isSaving = true;
    this.saveError = null;

    try {
      yield quizApi.save(meetingStore.slug, problemId);

      if (this.isLoadedAll) {
        this.problemsAll = this.problemsAll.map((prblm) => {
          if (prblm.id === problemId) {
            return { ...prblm, bookmarked: true };
          }
          return prblm;
        });
      }
      if (this.isLoadedLaunched) {
        this.problemsLaunched = this.problemsLaunched.map((prblm) => {
          if (prblm.id === problemId) {
            return { ...prblm, bookmarked: true };
          }
          return prblm;
        });
      }
      if (this.isLoadedSaved) {
        const newSavedProblem = this.getProblemById(problemId);
        this.problemsSaved = [newSavedProblem, ...this.problemsSaved];
      }

      this.track(ActionTypes.BOOKMARK_PROBLEM);
      toast.show({ message: 'Quiz Saved' });
    } catch (error) {
      this.submitError = error;
      if (!(error instanceof UserAuthenticationError)) {
        toast.show({
          message: 'Failed to Save Quiz!',
          type: 'error',
        });
      }
    }
    this.isSaving = false;
  });

  unsaveProblem = flow(function* (problemId) {
    if (!meetingStore.slug) {
      return;
    }
    this.isSaving = true;
    this.saveError = null;

    try {
      yield quizApi.unsave(meetingStore.slug, problemId);

      if (this.isLoadedAll) {
        this.problemsAll = this.problemsAll.map((prblm) => {
          if (prblm.id === problemId) {
            return { ...prblm, bookmarked: false };
          }
          return prblm;
        });
      }
      if (this.isLoadedLaunched) {
        this.problemsLaunched = this.problemsLaunched.map((prblm) => {
          if (prblm.id === problemId) {
            return { ...prblm, bookmarked: false };
          }
          return prblm;
        });
      }
      if (this.isLoadedSaved) {
        this.problemsSaved = this.problemsSaved.filter(
          (prblm) => prblm.id !== problemId,
        );
      }

      toast.show({ message: 'Quiz Unsaved' });
    } catch (error) {
      this.submitError = error;
      if (!(error instanceof UserAuthenticationError)) {
        toast.show({
          message: 'Failed to Unsave Quiz!',
          type: 'error',
        });
      }
    }
    this.isSaving = false;
  });

  update = flow(function* () {
    if (this.isSubmitting || !meetingStore.slug) {
      return;
    }

    this.isSubmitting = true;
    this.submitError = null;

    try {
      const payload = this._editQuizPayload();
      yield quizApi.update(
        meetingStore.slug,
        this.editingQuizId,
        payload,
      );

      if (this.isLoadedAll) {
        this.problemsAll = this.problemsAll.map((prblm) => {
          if (prblm.id === this.editingQuizId) {
            return payload.problem;
          }
          return prblm;
        });
      }
      if (this.isLoadedLaunched) {
        this.problemsLaunched = this.problemsLaunched.map((prblm) => {
          if (prblm.id === this.editingQuizId) {
            return payload.problem;
          }
          return prblm;
        });
      }

      this.resetFields();
      toast.show({
        message: `Quiz updated successfully`,
      });
      this.setPreviewQuiz(this.editingQuizId);
      this.setEditingQuiz(null);
    } catch (error) {
      this.submitError = error;
      if (!(error instanceof UserAuthenticationError)) {
        toast.show({
          message: 'Failed to update quiz!',
          type: 'error',
        });
      }
    }

    this.isSubmitting = false;
  });

  // NOTE: This rebpublish only happens 3 seconds after,
  // and not very configurable at the moment
  republish(quizId) {
    const delayTime = 3000;
    if (!meetingStore.slug || !this.quizzes[quizId]) {
      return;
    }
    const { meeting } = meetingStore;
    setTimeout(() => {
      if (meeting && meeting.manager) {
        const { manager } = meeting;
        manager.publishRecentQuiz(quizId);
      }
    }, delayTime);
  }

  // eslint-disable-next-line class-methods-use-this
  track(actionType, ...args) {
    return new Promise(resolve => {
      if (window.storeEsEvent) {
        window.storeEsEvent(actionType, ...args);
      }
      resolve();
    });
  }

  addChoice() {
    this.choices.push({ ...DEFAULT_CHOICE });
  }

  cloneQuiz(problemId) {
    const problem = this.getProblemById(problemId);
    this._populateFields(problem);
  }

  markChoiceAsCorrect(choiceIndex) {
    this.choices.forEach((choice, index) => {
      // eslint-disable-next-line no-param-reassign
      choice.is_correct_answer = choiceIndex === index;
    });
  }

  removeChoice(choiceIndex) {
    if (!this.canRemoveChoice) {
      return;
    }

    this.choices.splice(choiceIndex, 1);
  }

  reset() {
    this.isLoaded = false;
    this.quizzes = null;
    this.problems = null;
    this.setEditingQuiz(null);
    this.setPreviewOpen(false);
    this.setPreviewQuiz(null);
    this.resetFields();
  }

  resetFields() {
    this.duration = DEFAULT_DURATION;
    this.description = '';
    this.choices = [...DEFAULT_CHOICES];
  }

  setActiveTab(tab) {
    this.activeTab = tab;
  }

  setChoice(value, choiceIndex) {
    const choice = this.choices[choiceIndex];
    choice.answer = value;
  }

  setDescription(description) {
    this.description = description;
  }

  setSearchQuery(searchQuery) {
    this.searchQuery = searchQuery;
    this.allPage = 1;
    this._reloadWithFilter();
    this.track(ActionTypes.FILTER_BY_SEARCH);
  }

  setSelectedTopic(selectedTopic) {
    this.selectedTopic = selectedTopic;
    this.allPage = 1;
    this._reloadWithFilter();
    this.track(ActionTypes.FILTER_BY_TOPIC);
  }

  setSelectedInstructor(selectedInstructor) {
    this.allPage = 1;
    this.selectedInstructor = selectedInstructor;
    this._reloadWithFilter();
    this.track(ActionTypes.FILTER_BY_INSTRUCTOR);
  }

  nextPage() {
    this.allPage += 1;
    this.loadAll({ forceServer: true });
  }

  nextSavedPage() {
    this.savedPage += 1;
    this.loadSaved({ forceServer: true });
  }

  setDuration(duration) {
    this.duration = duration;
  }

  setEditingQuiz(quizId) {
    this.editingQuizId = quizId;

    const quiz = this.getProblemById(quizId);
    if (quiz) {
      this._populateFields(quiz);
    } else {
      this.resetFields();
    }
  }

  setHQOpen(isOpen) {
    this.isHQOpen = isOpen;
  }

  setPreviewOpen(isOpen) {
    this.isPreviewOpen = isOpen;
  }

  setPreviewQuiz(problemId) {
    this.previewProblemId = problemId;
  }

  getProblemById(id) {
    const problem = this.problemsAll.find(prblm => prblm.id === id)
      || this.problemsSaved.find(prblm => prblm.id === id)
      || this.problemsLaunched.find(prblm => prblm.id === id);

    return problem;
  }

  get areChoicesValid() {
    return this.choices.every(o => isChoiceValid(o.answer));
  }

  // Allow to remove choice only if there are more than 2 choices
  get canRemoveChoice() {
    return this.choices.length > 2;
  }

  // Bunch of validations that check if the quiz can be submitted either for
  // creation or for updation
  get canSubmit() {
    return this.validationErrors.length === 0;
  }

  get correctChoiceIndex() {
    return findIndex(this.choices, o => o.is_correct_answer);
  }

  get editingQuiz() {
    if (this.editingQuizId) {
      return this.getProblemById(this.editingQuizId);
    } else {
      return null;
    }
  }

  get validationErrors() {
    const errors = [];
    if (!this.isCorrectAnswerMarked) {
      errors.push('One of the choices should be marked as correct answer');
    }

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

    const hasSpecialDesc = containsSpecialCharacters(
      this.description,
    );
    const hasSpecialChoice = this.choices.some(
      o => containsSpecialCharacters(o.answer),
    );
    if (hasSpecialDesc || hasSpecialChoice) {
      errors.push(
        'Special characters (mathematical symbols,'
        + ' emojis, etc.) are not supported.'
        + ' Please use only standard text characters.',
      );
    }

    return errors;
  }

  get isCorrectAnswerMarked() {
    return this.correctChoiceIndex > -1;
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

  get previewQuiz() {
    if (this.previewProblemId) {
      return this.getProblemById(this.previewProblemId);
    } else {
      return null;
    }
  }

  get quizCount() {
    return this.quizList.length;
  }

  get allProblemCount() {
    return this.problemsAll.length;
  }

  get savedProblemCount() {
    return this.problemsSaved.length;
  }

  get launchedProblemCount() {
    return this.problemsLaunched.length;
  }

  get quizList() {
    const list = [];

    forOwn(this.quizzes, (quiz) => {
      const newQuiz = transformQuizData(quiz, this.problems);
      list.push(newQuiz);
    });

    return orderBy(list, [function (listItem) {
      const requiredOrder = ['locked', 'unlocked', 'cancelled', 'completed'];
      return requiredOrder.indexOf(listItem.status);
    }]);
  }

  /* Private */

  _createQuizPayload(publish) {
    const quizNum = this.meta.all_problems_count + 1;
    return {
      name: `Quiz ${quizNum}`,
      duration: this.duration,
      publish,
      problems: [{
        title: `${meetingStore.slug} - Quiz ${quizNum} - Problem 1`,
        description: this.description,
        choices: toJS(this.choices),
      }],
    };
  }

  _createNewProblem(quiz, quizProblems, isLaunched, participantName) {
    const problemId = quiz.problems[0];
    const prblmObject = quizProblems[problemId];
    return {
      bookmarked: 0,
      choices: prblmObject.choices,
      created_at: quiz.created_at,
      description: prblmObject.description,
      duration: quiz.duration,
      id: problemId,
      in_current_meeting: 1,
      is_launched: isLaunched ? 1 : 0,
      name: participantName,
      score: prblmObject.score,
      title: prblmObject.title,
      topics: this.meta ? this.meta.meeting_topics : '',
    };
  }

  _reloadWithFilter() {
    this.isLoadedAll = false;
    this.loadErrorAll = null;
    this.loadAll({ filterChange: true });
  }

  _editQuizPayload() {
    const problem = this.editingQuiz;
    return {
      problem: {
        ...problem,
        duration: this.duration,
        description: this.description,
        choices: toJS(this.choices),
      },
    };
  }

  _populateFields(problem) {
    this.duration = problem.duration;
    this.description = problem.description;
    this.choices = toJS([...problem.choices]);
  }

  _tryQuizLaunch(quizId) {
    if (this.isLive) {
      const { manager } = meetingStore.meeting;
      const quiz = this.quizList.find(o => o.id === quizId);
      manager.launchQuiz(quiz);
      this.setHQOpen(false);
    }
  }

  _setStatus(quizId, status) {
    const quiz = this.quizzes[quizId];
    quiz.status = status;
    this.quizzes = {
      ...this.quizzes,
      [quizId]: quiz,
    };
  }
}

const quizStore = new QuizStore();

export default quizStore;
