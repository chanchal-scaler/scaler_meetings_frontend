import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import HelperText from './HelperText';
import Label from './Label';

// Can be any input field, default is `input`
function Field({
  children,
  className,
  compact,
  error,
  errorMessage,
  hint,
  inline = false,
  label,
  required,
  formFieldHeaderClassName,
  labelClassName,
  ...remainingProps
}) {
  function hintUi() {
    if (hint) {
      return (
        <HelperText>
          {hint}
        </HelperText>
      );
    } else {
      return null;
    }
  }

  function labelUi() {
    if (label) {
      return (
        <Label
          compact={compact}
          className={classNames(
            { [labelClassName]: labelClassName },
          )}
          required={required}
        >
          {label}
        </Label>
      );
    } else {
      return null;
    }
  }

  function errorUi() {
    if (error) {
      return error;
    } else if (errorMessage) {
      return (
        <HelperText type="error">
          {errorMessage}
        </HelperText>
      );
    } else {
      return null;
    }
  }

  return (
    <div
      className={classNames(
        'form-field',
        { 'form-field--inline': inline },
        { 'form-field--compact': compact },
        { [className]: className },
      )}
      {...remainingProps}
    >
      <div
        className={classNames(
          'form-field__header',
          { 'form-field__header--present': label || hint },
          { [formFieldHeaderClassName]: formFieldHeaderClassName },
        )}
      >
        {labelUi()}
        {hintUi()}
      </div>
      {children}
      {errorUi()}
    </div>
  );
}

Field.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  compact: PropTypes.bool,
  error: PropTypes.node,
  errorMessage: PropTypes.node,
  hint: PropTypes.node,
  inline: PropTypes.bool.isRequired,
  label: PropTypes.node,
  required: PropTypes.bool,
};

export default Field;
