import { Observer } from 'mobx-react';
import { mobxify } from '~meetings/ui/hoc';
import useAddIncomingEventListeners from
  '~meetings/hooks/useAddIncomingEventListeners';

function IncomingEvents({
  children,
  meetingStore: store,
}) {
  const { data, meeting } = store;

  useAddIncomingEventListeners(meeting);

  return (
    <Observer>
      {() => children({ data })}
    </Observer>
  );
}

export default mobxify('meetingStore')(IncomingEvents);
