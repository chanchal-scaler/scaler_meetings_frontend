import { apiRequest, generateJWT } from '@common/api/utils';
import {
  getAttribution,
  setAttribution,
} from '@common/vanilla_ui/tracking/attribution';
import { INTENTS } from '@common/vanilla_ui/tracking/constants';
import Toastify from 'toastify-js';

const GET_LIVE_CLASS_ENDPOINT = '/api/v3/analytics/attributions/';


const PROGRAM_MAPPING = {
  'ai-ml': 'ai_ml',
};

const DEFAULT_ERROR_MESSAGE = 'Free Live class cannot be booked right'
+ ' now. Please try later';

const getRegistrationAttributions = (program) => {
  setAttribution(INTENTS.AI_ML_REGISTRATION, {
    program: PROGRAM_MAPPING[program] || PROGRAM_MAPPING.academy,
  });

  return getAttribution();
};


function handleRegistration(token, program) {
  const refererUrl = new URL(window.location.href);
  const attributions = {
    ...getRegistrationAttributions(program),
    product: 'scaler',
    sub_product: 'ai_ml_homepage',
    element: 'ai_ml_registration_btn',
  };

  return apiRequest(
    'POST',
    GET_LIVE_CLASS_ENDPOINT,
    {
      attributions,
      owner: {
        id: 1,
        type: 'AIMLRegistration',
      },
    },
    {
      headers: {
        'X-user-token': token,
        'X-REFERER': refererUrl.toString(),
      },
    },
  );
}

export async function handlePageRegistration(
  program, onSuccessFullBooking,
) {
  try {
    const jwt = await generateJWT();

    await handleRegistration(jwt, program);
  } catch (error) {
    Toastify({
      text: DEFAULT_ERROR_MESSAGE,
      className: 'danger',
    });
    window.GTMtracker?.pushEvent({
      event: 'gtm_custom_click',
      data: {
        form_status: 'default-live-class-booking-error',
      },
    });
  } finally {
    onSuccessFullBooking?.();
  }
}
