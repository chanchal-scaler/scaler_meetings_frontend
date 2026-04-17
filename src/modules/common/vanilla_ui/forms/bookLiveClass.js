import { apiRequest, generateJWT } from '@common/api/utils';
import CaseUtil from '@common/lib/caseUtil';
import {
  getAttribution,
  setAttribution,
} from '@common/vanilla_ui/tracking/attribution';
import { INTENTS } from '@common/vanilla_ui/tracking/constants';
import Toastify from 'toastify-js';

const GET_LIVE_CLASS_ENDPOINT = '/api/v4/event_groups';

const PROGRAM_TO_SLUG = {
  academy: 'free-class-with-founders-academy',
  'data-science': 'free-class-with-founders-dsml',
  devops: 'free-class-with-founders-academy',
  'ai-ml': 'free-class-with-founders-dsml',
};
const PROGRAM_MAPPING = {
  academy: 'software_development',
  'data-science': 'data_science',
  devops: 'devops',
  'ai-ml': 'ai_ml',
};

const DEFAULT_ERROR_MESSAGE = 'Free Live class cannot be booked right'
+ ' now. Please try later';

const getRegistrationAttributions = (program) => {
  setAttribution(INTENTS.BOOK_LIVE_CLASS, {
    program: PROGRAM_MAPPING[program] || PROGRAM_MAPPING.academy,
  });

  return getAttribution();
};

function getUpcomingLiveClass(program, token) {
  return apiRequest(
    'GET',
    `${GET_LIVE_CLASS_ENDPOINT}/${PROGRAM_TO_SLUG[program]}`,
    {},
    {
      headers: {
        'X-user-token': token,
      },
    },
  );
}

function registerEvent(id, token, program) {
  const refererUrl = new URL(window.location.href);
  refererUrl.searchParams.set('default-live-class-booking', true);

  return apiRequest(
    'POST',
    `/api/v3/events/${id}/registration`,
    {
      attributions: getRegistrationAttributions(program),
    },
    {
      headers: {
        'X-user-token': token,
        'X-REFERER': refererUrl.toString(),
      },
    },
  );
}

export async function bookLiveClass(
  program, freeLiveClassId = '', onSuccessFullBooking,
  onForceRedirection,
) {
  const formattedProgram = CaseUtil.toCase('kebabCase', program);
  try {
    const jwt = await generateJWT();
    let eventId;

    if (freeLiveClassId.length === 0) {
      const freeLiveClass = await getUpcomingLiveClass(formattedProgram, jwt);
      eventId = freeLiveClass?.data?.id;
    } else {
      eventId = freeLiveClassId;
    }

    if (eventId) {
      await registerEvent(eventId, jwt, program);
      window.GTMtracker?.pushEvent({
        event: 'gtm_custom_click',
        data: {
          form_status: 'default-live-class-booking-success',
        },
      });
    }
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
    if (onForceRedirection) {
      window.GTMtracker?.pushEvent({
        event: 'gtm_custom_click',
        data: {
          click_text: 'book-live-class-cpe-redirection',
        },
      });
      onForceRedirection();
    } else if (formattedProgram === 'ai-ml') {
      window.GTMtracker?.pushEvent({
        event: 'gtm_custom_click',
        data: {
          click_text: 'free-product-redirection',
        },
      });
      window.location.replace(`/ai_ml/free-live-class`);
    } else {
      window.GTMtracker?.pushEvent({
        event: 'gtm_custom_click',
        data: {
          click_text: 'free-product-redirection',
        },
      });
      window.location.replace(`/${formattedProgram}/free-live-class`);
    }
  }
}
