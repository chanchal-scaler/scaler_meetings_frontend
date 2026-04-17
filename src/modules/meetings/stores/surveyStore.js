import {
  action, computed, flow, makeObservable, observable,
} from 'mobx';
import { toast } from '@common/ui/general/Toast';

import meetingStore from './meetingStore';
import surveyApi from '~meetings/api/survey';

const SURVEY_TIME_PER_FORM = 30;

class SurveyStore {
  isHQOpen = false;

  isPreviewOpen = true;

  isLoaded = false;

  isLoading = false;

  launchedSurveyId = null;

  surveyResults = []

  constructor() {
    makeObservable(this, {
      isPreviewOpen: observable,
      launchedSurveyId: observable,
      surveyResults: observable,
      isLive: computed,
      isHQOpen: observable,
      isLoaded: observable,
      setHQOpen: action.bound,
      setPreviewOpen: action.bound,
      isLoading: observable,
    });
  }

  load = flow(function* (forceServer = false) {
    if (this.isLoading) {
      return;
    }
    if (!this.isLoaded || forceServer) {
      this.isLoading = true;
      this.loadError = null;

      try {
        const params = {
          'api_context[type]': 'Meeting',
          'api_context[id]': meetingStore.data?.id,
        };
        const json = yield surveyApi.getList(params);
        this.templates = json.meta?.templates;
        if (json.data?.length) {
          const lastLunchedSurvey = json.data[json.data?.length - 1];
          this.launchedSurveyId = lastLunchedSurvey?.id;
        }
        this.isLoaded = true;
        this.isLoading = false;
      } catch (error) {
        this.loadError = error;
      }
    }
  });

  results = flow(function* (forceServer = false) {
    if (this.isLoading) {
      return;
    }
    if (!this.isLoaded || forceServer) {
      this.isLoading = true;
      this.loadError = null;

      try {
        const json = yield surveyApi.getResult(this.launchedSurveyId);
        this.surveyResults = json.included;
        this.isLoaded = true;
      } catch (error) {
        this.loadError = error;
      }

      this.isLoading = false;
    }
  });

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

  setHQOpen(isOpen) {
    this.isHQOpen = isOpen;
  }

  setPreviewOpen(isOpen) {
    this.isPreviewOpen = isOpen;
  }

  get templateCount() {
    return this.templates?.length;
  }

  // eslint-disable-next-line require-yield
  create = flow(function* () {
    this.isSubmitting = true;
    this.submitError = null;

    try {
      const json = yield surveyApi.createAndPublish(this.surveyParams);
      this.survey = json.data;
      this.launchedSurveyId = json?.data?.id;
      this.surveyResults = [];
      if (json.success) {
        this._trySurveyLaunch(this.launchedSurveyId);
        this.republish(this.launchedSurveyId);
        toast.show({ message: 'Survey created successfully' });
        this.isHQOpen = false;
      }
    } catch (error) {
      toast.show({
        message: 'Failed to create survey!',
        type: 'error',
      });
      this.submitError = error;
    }
    this.isSubmitting = false;
  });

  republish(surveyId) {
    const delayTime = 3000;
    if (!meetingStore.slug || !this.launchedSurveyId) {
      return;
    }
    const { meeting } = meetingStore;
    setTimeout(() => {
      if (meeting && meeting.manager) {
        const { manager } = meeting;
        manager.publishRecentSurvey(surveyId);
      }
    }, delayTime);
  }

  _trySurveyLaunch() {
    if (this.isLive) {
      const { meeting } = meetingStore;
      const { manager, user } = meeting;
      manager.launchSurvey(this.survey, user.user_id);
      this.setHQOpen(false);
    }
  }

  _populateFields(survey) {
    this.surveyParams = {
      api_context: {
        id: meetingStore?.data?.id,
        type: 'Meeting',
      },
      label: survey.name,
      auto_launch: true,
      duration: survey.forms?.length * SURVEY_TIME_PER_FORM,
      interviewbit_forms: survey.forms,
    };
  }

  getSurveyResluts(survey) {
    this.surveyPreviewId = survey.id;
    this.surveyResults = [];
    this.isPreviewOpen = true;
    this.results(true);
  }

  publishTemplate(survey) {
    this._populateFields(survey);
    this.create(true);
  }
}

const surveyStore = new SurveyStore();

export default surveyStore;
