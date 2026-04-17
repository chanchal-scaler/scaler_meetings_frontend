import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import { HelperText } from '@common/ui/form';
import FormContext from './context';

function FieldError({ name, ...remainingProps }) {
  const { formState } = useContext(FormContext);
  const error = formState.errors[name];
  if (error) {
    return (
      <HelperText type="error" {...remainingProps}>
        {error}
      </HelperText>
    );
  } else {
    return null;
  }
}

FieldError.propTypes = {
  name: PropTypes.string.isRequired,
};

export default FieldError;
