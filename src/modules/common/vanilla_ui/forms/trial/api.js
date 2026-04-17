import { apiRequest } from '@common/api/utils';
import {
  detailFields,
  registerFields,
} from './constants';
import utils from './utils';

async function createApplicant(createATSEndPoint) {
  const payload = { source: `advertisement` };
  await apiRequest('GET', createATSEndPoint, payload);
}

async function getCompanies(keyword) {
  const json = await apiRequest(
    'GET',
    '/get-companies',
    null,
    { params: { q: keyword } },
  );
  return json.items.map(item => ({ label: item.text, value: item.id }));
}

async function getUniversities(keyword) {
  const json = await apiRequest(
    'GET',
    '/get-universities',
    null,
    { params: { q: keyword } },
  );
  return json.items.map(item => ({ label: item.text, value: item.id }));
}

async function otpResend(voice) {
  const payload = {
    user: {},
  };
  payload.user.phone_number = utils.phoneNumberValue();
  registerFields.forEach(field => {
    if (field) {
      payload.user[field] = utils.getFieldValue(field);
    }
  });
  let endpoint = `/users/v2/account/`;
  if (voice) {
    endpoint += `voice`;
  } else {
    endpoint += `otp`;
  }
  await apiRequest('POST', endpoint, payload);
}

async function otpVerify(type = null) {
  const payload = {
    user: {},
  };
  payload.user.phone_number = utils.phoneNumberValue();
  payload.user.skip_existing_user_check = true;
  registerFields.forEach(field => {
    if (field) {
      payload.user[field] = utils.getFieldValue(field);
    }
  });
  payload.user.type = type;
  payload.user.otp = document.querySelector('input[name="otp"]').value;
  await apiRequest('POST', '/users/v2/verify', payload);
}

async function detailSubmission() {
  const payload = {
    user: {},
  };
  detailFields.forEach(field => {
    if (field) {
      payload.user[field] = utils.getFieldValue(field);
    }
  });
  payload.user.phone_number = utils.phoneNumberValue();
  payload.user.experience = +payload.user.experience_years * 12
    + +payload.user.experience_months;
  payload.phone_number = utils.phoneNumberValue();
  await apiRequest('PUT', `/users/v2/account`, payload);
}

async function registration() {
  const payload = {
    type: utils.getFieldValue('type'),
    user: {},
  };
  payload.user.phone_number = utils.phoneNumberValue();
  payload.user.skip_existing_user_check = true;
  registerFields.forEach(field => {
    if (field) {
      payload.user[field] = utils.getFieldValue(field);
    }
  });
  payload['g-recaptcha-response'] = document.querySelector(
    '[name=g-recaptcha-response]',
  ).value;
  // payload.user.experience = parseInt(
  //   utils.getFieldValue('experience_years'),
  //   10,
  // ) * 12 + parseInt(utils.getFieldValue('experience_months'), 10);
  await apiRequest('POST', `/users/v2`, payload);
}

export default {
  createATS: createApplicant,
  register: registration,
  submitDetails: detailSubmission,
  resendOtp: otpResend,
  verifyOtp: otpVerify,
  getUniversities,
  getCompanies,
};
