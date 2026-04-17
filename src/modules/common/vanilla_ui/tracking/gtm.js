const WHATSAPP_CONSENT_YES = 'whatsapp_consent_yes';

function sendUserDataEvent(type, form, verified) {
  const data = {
    cu_college_name: type === 'academy'
      ? form.getFieldValue('university') : form.getFieldValue('university'),
    cu_year_of_graduation: form.getFieldValue('orgyear')
      ? parseInt(form.getFieldValue('orgyear'), 10) : undefined,
    cu_degree_name: type === 'academy'
      ? form.getFieldValue('degree') : form.getFieldValue('field'),
    cu_phone_verified: verified,
    we_email_opt_in: true,
    we_sms_opt_in: true,
    phone_number: form.getFieldValue('phone_number'),
  };
  if (type === 'academy') {
    Object.assign(data, {
      we_company: form.getFieldValue('orgname'),
      cu_job_role: form.getFieldValue('position'),
      cu_ctc: form.getFieldValue('base_ctc'),
      we_whatsapp_opt_in:
        form.getFieldValue('whatsapp_consent') === WHATSAPP_CONSENT_YES,
    });
  }
  window.GTMtracker?.trackEvent('userDetailsFilledFormatter', {
    stage: '2',
  });
  window.GTMtracker?.trackEvent('userExtraDataFormatter', data);
}

function sendFormSubmitStatus(stage, status, message) {
  if (window.GTMtracker) {
    window.GTMtracker.trackEvent('formSubmitStatusFormatter', {
      stage,
      status,
      message,
    });
  }
}

function sendLoginWithEmail(email) {
  if (window.GTMtracker) {
    window.GTMtracker.trackEvent('loginWithEmailFormatter', { email });
  }
}

function sendTrackUser(email) {
  if (window.GTMtracker) {
    window.GTMtracker.trackEvent('trackUserFormatter', { email });
  }
}

function sendModalOpen(element, status) {
  if (window.GTMtracker) {
    window.GTMtracker.trackEvent('modalChangeFormatter', { element, status });
  }
}

function sendCustomClick(clickType, customAttributes) {
  if (window.GTMtracker) {
    window.GTMtracker.pushEventCustomAttributes({
      event: 'gtm_custom_click',
      data: {
        click_type: clickType,
      },
      customAttributes,
    });
  }
}

export default {
  sendUserDataEvent,
  sendFormSubmitStatus,
  sendLoginWithEmail,
  sendModalOpen,
  sendTrackUser,
  sendCustomClick,
};
