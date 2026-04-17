import React, {
  useCallback, useMemo, useReducer,
} from 'react';
import PropTypes from 'prop-types';

import { apiRequest } from '@common/api/utils';
import { FeedbackStateContext, FeedbackActionsContext } from './context';
import { isString } from '@common/utils/type';
import { toast } from '@common/ui/general/Toast';
import { feedbackFormGtmEvent } from '@common/utils/gtm';
import FeedbackForm from './FeedbackForm';
import reducer, { ActionTypes, getInitialState } from './store';

function areRequiredFilled(fields, forms) {
  const requiredForms = forms.filter(o => o.required);
  return requiredForms.every(form => {
    let value = fields[`field_${form.id}`];
    if (isString(value)) {
      value = value.trim();
    }
    return Boolean(value);
  });
}

function Feedback({
  endpoint,
  method = 'POST',
  forms,
  onSubmitSuccess,
  onSubmitError,
  ...remainingProps
}) {
  const [state, dispatch] = useReducer(reducer, getInitialState(forms));

  const setFieldValue = useCallback((name, value) => {
    dispatch({ type: ActionTypes.UPDATE_FIELD, payload: { name, value } });
  }, []);

  const submitFeedback = useCallback(async (event) => {
    event.preventDefault();

    if (!areRequiredFilled(state.fields, forms)) {
      toast.show({
        message: 'Please fill all required fields',
      });
      return;
    }

    dispatch({ type: ActionTypes.SET_SUBMIT_INIT });
    try {
      const responses = forms.map(form => ({
        id: form.id,
        value: state.fields[`field_${form.id}`],
      }));
      feedbackFormGtmEvent(responses);
      const json = await apiRequest(method, endpoint, { responses });
      dispatch({ type: ActionTypes.SET_SUBMIT_DONE });
      if (onSubmitSuccess) {
        onSubmitSuccess(json);
      }
    } catch (error) {
      dispatch({ type: ActionTypes.SET_SUBMIT_ERROR, payload: error });
      if (onSubmitError) {
        onSubmitError(error);
      }
    }
  }, [endpoint, forms, method, onSubmitError, onSubmitSuccess, state.fields]);

  const methods = useMemo(() => ({
    setFieldValue,
    submitFeedback,
  }), [setFieldValue, submitFeedback]);

  return (
    <FeedbackStateContext.Provider value={{ ...state, forms }}>
      <FeedbackActionsContext.Provider value={methods}>
        <FeedbackForm {...remainingProps} />
      </FeedbackActionsContext.Provider>
    </FeedbackStateContext.Provider>
  );
}

Feedback.propTypes = {
  endpoint: PropTypes.string.isRequired,
  forms: PropTypes.array.isRequired,
  method: PropTypes.string.isRequired,
  onSubmitSuccess: PropTypes.func,
  onSubmitError: PropTypes.func,
};

export default Feedback;
