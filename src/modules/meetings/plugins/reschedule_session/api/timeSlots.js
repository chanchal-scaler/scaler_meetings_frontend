import { apiRequest } from '@common/api/utils';

const PREFIX_URL_MMS = '/academy/mentee-mentor-session';
const PREFIX_URL_MENTEE = '/academy/mentee-dashboard';
const PREFIX_URL_MENTOR = '/academy/mentor-dashboard';

function requestAdditionalTimeSlots() {
  return apiRequest(
    'POST',
    `${PREFIX_URL_MENTEE}/mentor_info/request-time-slots`,
  );
}

function rescheduleSessionMentee(
  sessionToRescheduleId,
  timeSlot,
) {
  return apiRequest(
    'POST',
    `${PREFIX_URL_MENTEE}/mentor_info/reschedule-session`,
    {
      mentee_mentor_session_action: 'reschedule',
      slot: timeSlot,
      mentee_mentor_session_id: sessionToRescheduleId,
      forced: true,
    },
  );
}

function rescheduleSessionMentor(
  sessionToRescheduleId,
  date,
  time,
) {
  return apiRequest(
    'POST',
    `${PREFIX_URL_MENTOR}/reschedule-mentor-session`,
    {
      mentee_mentor_session_id: sessionToRescheduleId,
      session_date: date,
      session_time: time,
      forced: true,
    },
  );
}

function getInitialRescheduleData(slug) {
  return apiRequest(
    'GET',
    `${PREFIX_URL_MMS}/resources-for-drona`,
    null,
    { params: { slug } },
  );
}

function getMentorTimeSlots() {
  return apiRequest(
    'GET',
    '/academy/mentee/time-slots',
  );
}

function getAllSlotsForMentor() {
  return apiRequest(
    'GET',
    `${PREFIX_URL_MENTOR}/time_slots/load-edit-data`,
  );
}

export default {
  requestTimeSlots: requestAdditionalTimeSlots,
  rescheduleSessionMentee,
  rescheduleSessionMentor,
  getInitialData: getInitialRescheduleData,
  getInitialDataMentee: getMentorTimeSlots,
  getInitialDataMentor: getAllSlotsForMentor,
};
