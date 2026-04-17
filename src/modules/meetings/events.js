import EventEmitter from '@common/lib/eventEmitter';

class MeetingEvents extends EventEmitter {
  JOINED_MEETING = 'live.joined_meeting';

  JOINED_RECORDED_MEETING = 'archive.joined_meeting';

  LEFT_MEETING = 'live.left_meeting';

  PARTICIPANT_JOINED = 'live.participant_joined';

  PARTICIPANT_LEFT = 'live.participant_left';

  STREAM_ADDED = 'live.stream_added';

  STREAM_REMOVED = 'live.stream_removed';

  MEETING_ENDED = 'live.meeting_ended';

  TYPEFORM_FEEDBACK_SUBMITTED = 'live.TYPEFORM_FEEDBACK_SUBMITTED';

  DOUBT_SESSION_STARTED = 'live.DOUBT_SESSION_STARTED';
}

const meetingEvents = new MeetingEvents();

export default meetingEvents;
