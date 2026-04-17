/* eslint-disable react/destructuring-assignment */
import React from 'react';
import classNames from 'classnames';

import Icon from '@common/ui/general/Icon';

function mapStatusName(status) {
  if (status === 'solved') {
    return 'Answered';
  } else if (status === 'attempted' || status === 'wrong_answer') {
    return 'Attempted';
  } else {
    return 'Not Attempted';
  }
}

function mapStatusClassName(status) {
  if (status === 'solved') {
    return 'answered';
  } else if (status === 'attempted' || status === 'wrong_answer') {
    return 'attempted';
  } else {
    return 'not_attempted';
  }
}

function mapStatusIconName(status) {
  if (status === 'solved') {
    return 'tick';
  } else if (status === 'attempted' || status === 'wrong_answer') {
    return 'clock';
  } else {
    return 'warning';
  }
}

const StatusTag = (props) => {
  const statusName = mapStatusName(props.status);
  const statusClassName = mapStatusClassName(props.status);
  const statusIconName = mapStatusIconName(props.status);
  const statusTagClasses = classNames(statusClassName, 'status-tag',
    { [props.className]: props.className });

  return (
    <span className={statusTagClasses}>
      <Icon name={statusIconName} className="status-icon" />
      {' '}
      {statusName}
    </span>
  );
};

export default StatusTag;
