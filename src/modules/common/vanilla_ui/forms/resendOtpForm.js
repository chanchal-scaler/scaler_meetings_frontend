import OtpForm from '@common/vanilla_ui/forms/otpForm';
import { shouldUseShortOtp } from '@common/utils/otp';

function initializeResendForm(formId, track) {
  const otpMsgForm = {
    formEle: document.getElementById(`${formId}-msg`),
  };

  otpMsgForm.updateField = function (fieldName, value) {
    const fieldEle = otpMsgForm.formEle?.querySelector(
      `input[name=${fieldName}]`,
    );
    if (fieldEle) {
      fieldEle.value = value;
    }
  };

  otpMsgForm.reset = () => {};
  const otpVoiceForm = new OtpForm(
    document.getElementById(`${formId}-voice`),
    {
      method: 'POST',
      endpoint: '/users/v2/account/voice',
      createPayload: values => ({
        user: values,
        short_otp: shouldUseShortOtp(),
      }),
    },
  );

  otpVoiceForm.on('submitted', () => {
    if (track) {
      track('resend-otp-voice', 'click', otpVoiceForm.getFieldValue('email'));
    }
  });
  otpVoiceForm.initialize();

  return {
    otpMsgForm,
    otpVoiceForm,
  };
}

export default {
  initialize: initializeResendForm,
};
