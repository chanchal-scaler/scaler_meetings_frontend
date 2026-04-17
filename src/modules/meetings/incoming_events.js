import EventEmitter from '@common/lib/eventEmitter';

class IncomingMeetingEvents extends EventEmitter {
  END_LIVE_MEETING = 'live.end_meeting';

  /**
   * Use this to add a message to the notice board
   * make sure the data passed can is compatible with one of
   * @type {NOTICE_BOARD_TYPES}
   * If not, using the default type add `notice_board_template_type` to the data
   */
  ADD_MESSAGE_TO_NOTICE_BOARD = 'live.add_message_to_notice_board';
}

const incomingMeetingEvents = new IncomingMeetingEvents();

export default incomingMeetingEvents;
