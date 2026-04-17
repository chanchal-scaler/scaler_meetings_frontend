import cogoToast from 'cogo-toast';

import { apiRequest, generateJWT } from '@common/api/utils';

import SignupDialog from './signup_dialog';
import { FORM_MODES } from './signup_dialog/constant';
import {
  setAttribution,
  getAttribution,
} from '@common/vanilla_ui/tracking/attribution';

const RESUME_DISCUSSION_TEST_SLUG = 'resume_consultation';
const TEST_ISSUANCE_URL = '/api/v3/ai_interviews/user_test';
const SECTION_ID = 'resume-discussion-strip';
const DEFAULT_REDIRECT_URL = `
  https://companion.scaler.com/judge/resume_consultation?autoLogin=true`;

const PROGRAM_MAPPING = {
  academy: 'software_development',
  data_science: 'data_science',
  ai_ml: 'ai_ml',
  devops: 'devops',
};

class ResumeDiscussionFlow extends SignupDialog {
  constructor(options = {}) {
    super('signup-dialog', { preventAutoRedirect: true });

    const valid = this._validateElements();

    if (!valid) return;
    this._initializeEle();
    this.options = {
      vertical: options.vertical || 'academy',
      ...options,
    };

    if (this._isLoggedIn()) this._attachBtnHandler();
    else this._attachFormHandlers();
  }

  _attachFormHandlers() {
    const forms = [
      this.getForm(FORM_MODES.signupOtp),
      this.getForm(FORM_MODES.emailLogin),
      this.getForm(FORM_MODES.loginOtp),
    ];

    forms.forEach((form) => {
      form?.on('submitted', this._handleCompletion);
    });
  }

  _attachBtnHandler() {
    if (this.buttonEl) {
      this.buttonEl.addEventListener('click', this._handleCompletion);
    }
  }

  _handleCompletion = async () => {
    try {
      const jwt = await generateJWT();
      setAttribution('resume_discussion_test_issued', {
        program: PROGRAM_MAPPING[this.options.vertical]
          || 'software_development',
      });
      const request = await apiRequest(
        'POST',
        TEST_ISSUANCE_URL,
        {
          test_slug: RESUME_DISCUSSION_TEST_SLUG,
          options: {
            name: 'Resume Discussion Mock Interview',
            send_lsq_activity: true,
            vertical: this.options.vertical,
            source: this.options.source,
          },
          attributions: getAttribution(),
        },
        { headers: { 'X-User-Token': jwt } },
      );

      const { success, url } = request;
      if (!success || !url) {
        throw new Error('Failed to issue companion interview');
      }
      if (url) {
        this._trackEvent('resume_discussion_code_success', url);
        cogoToast.success('Interview scheduled successfully');
        setTimeout(() => {
          window.location.href = `${url}?autoLogin=true`;
        }, 2000);
      }
    } catch (e) {
      cogoToast.error(
        e.responseJson?.message || 'Something went wrong. Please try again!',
      );
      setTimeout(() => {
        window.location.href = DEFAULT_REDIRECT_URL;
      }, 2000);
      this._trackEvent('resume_discussion_code_error', e.message);
    }
  };

  _validateElements = () => {
    const requiredElementsIds = ['resume-discussion-strip-section'];

    const missingElements = requiredElementsIds.filter(
      (element) => !document.getElementById(element),
    );

    return missingElements?.length === 0;
  };

  _initializeEle() {
    this.sectionEl = document.getElementById(`${SECTION_ID}-section`);
    this.buttonEl = this.sectionEl.querySelector(`.${SECTION_ID}__primary-cta`);
    this.rootEl = this.sectionEl.querySelector(`.${SECTION_ID}__root`);
  }

  _isLoggedIn() {
    return this.rootEl?.getAttribute('data-logged-in') === 'true';
  }

  // eslint-disable-next-line class-methods-use-this
  _trackEvent(clickType, clickValue) {
    window.GTMtracker?.pushEvent({
      event: 'gtm_custom_click',
      data: {
        click_type: clickType,
        click_value: clickValue,
      },
    });
  }
}

export default ResumeDiscussionFlow;
