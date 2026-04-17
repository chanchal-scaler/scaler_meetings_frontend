import PropTypes from 'prop-types';

import { MeetingStatus } from '~meetings/utils/meeting';
import { useCurrentStatus } from '~meetings/hooks';

function StatusRenderer({ children, status }) {
  const _status = useCurrentStatus();

  console.log({
    status,
    _status,
  });

  if (status === _status) {
    return children();
  } else {
    return null;
  }
}

StatusRenderer.propTypes = {
  children: PropTypes.func.isRequired,
  status: PropTypes.oneOf(Object.values(MeetingStatus)),
};

export default StatusRenderer;
