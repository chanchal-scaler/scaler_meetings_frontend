import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

function FormGroup({
  className,
  title,
  children,
}) {
  return (
    <div
      className={classNames(
        'form-group',
        { [className]: className },
      )}
    >
      <div className="form-group-label">
        {title}
      </div>
      <div className="form-group-content">
        {children}
      </div>
    </div>
  );
}

FormGroup.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  title: PropTypes.node.isRequired,
};

export default FormGroup;
