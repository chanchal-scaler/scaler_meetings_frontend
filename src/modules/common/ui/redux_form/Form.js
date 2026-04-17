import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { forwardRef } from '@common/ui/hoc';
import FormContext from './context';

function Form({
  className,
  formActions,
  formState,
  forwardedRef,
  ...remainingProps
}) {
  return (
    <FormContext.Provider
      value={{
        formActions,
        formState,
      }}
    >
      <form
        className={classNames(
          'form',
          { [className]: className },
        )}
        ref={forwardedRef}
        {...remainingProps}
      />
    </FormContext.Provider>
  );
}

Form.propTypes = {
  classNames: PropTypes.string,
  formActions: PropTypes.object.isRequired,
  formState: PropTypes.object.isRequired,
};

export default forwardRef(Form);
