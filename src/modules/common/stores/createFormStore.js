import get from 'lodash/get';
import keys from 'lodash/keys';
import pickBy from 'lodash/pickBy';

import { apiRequest } from '@common/api/utils';
import { fromTemplate } from '@common/utils/string';
import { isNullOrUndefined } from '@common/utils/type';

export default function createFormStore({
  endpoint,
  fields,
  method = 'POST',
  // name of the reducer
  name: reducerName,
  createPayload,
}) {
  const initialFields = { ...fields };

  const UPDATE_FIELD_VALUE = `${reducerName}/UPDATE_FIELD_VALUE`;
  // To update multiple field values in on dispatch, general
  // use case is when loading forms saved data from server
  const UPDATE_FIELD_VALUES = `${reducerName}/UPDATE_FIELD_VALUES`;
  // To reset field value to it's initial value
  // use case: reset single filter field in a filter form
  const RESET_FIELD_VALUE = `${reducerName}/RESET_FIELD_VALUE`;
  const RESET_FIELD_VALUES = `${reducerName}/RESET_FIELD_VALUES`;
  const UPDATE_FIELD_ERROR = `${reducerName}/UPDATE_FIELD_ERROR`;
  const UPDATE_FIELD_ERRORS = `${reducerName}/UPDATE_FIELD_ERRORS`;
  const RESET_FIELD_ERRORS = `${reducerName}/RESET_FIELD_ERRORS`;
  // Form level error
  const UPDATE_FORM_ERROR = `$${reducerName}/UPDATE_FORM_ERROR`;
  const SET_SUBMITTING = `${reducerName}/SET_SUBMITTING`;

  const formFields = keys(fields);

  function resetField(name) {
    return (dispatch) => dispatch({
      type: RESET_FIELD_VALUE,
      payload: { name },
    });
  }

  function resetFields() {
    return (dispatch) => dispatch({ type: RESET_FIELD_VALUES });
  }

  function resetErrors() {
    return (dispatch) => dispatch({ type: RESET_FIELD_ERRORS });
  }

  function updateField(name, value) {
    return (dispatch) => dispatch({
      type: UPDATE_FIELD_VALUE,
      payload: { name, value },
    });
  }

  function updateFields(valuesMap) {
    return (dispatch) => dispatch({
      type: UPDATE_FIELD_VALUES,
      payload: valuesMap,
    });
  }

  function updateFieldError(name, error) {
    return (dispatch) => dispatch({
      type: UPDATE_FIELD_ERROR,
      payload: { name, error },
    });
  }

  function updateFieldErrors(errorsMap) {
    return (dispatch) => dispatch({
      type: UPDATE_FIELD_ERRORS,
      payload: errorsMap,
    });
  }

  // Any extra data should be send in `extraData`
  function submitForm(
    extraData = {},
    altEndpoint = endpoint,
    currentFormState,
    apiOptions = {},
  ) {
    return async (dispatch, getState) => {
      dispatch({ type: SET_SUBMITTING, payload: true });

      try {
        const formState = get(getState(), reducerName) || currentFormState;
        let formData;
        if (createPayload) {
          // Passing extra data to createPayload method
          formData = createPayload(formState, extraData);
        } else {
          formData = {
            ...formState.fields,
            ...extraData,
          };
        }

        const finalEndpoint = fromTemplate(altEndpoint, formState.fields);
        const json = await apiRequest(
          method, finalEndpoint, formData, apiOptions,
        );
        dispatch({ type: SET_SUBMITTING, payload: false });
        return json;
      } catch (error) {
        dispatch({ type: UPDATE_FORM_ERROR, payload: error });
        dispatch({ type: SET_SUBMITTING, payload: false });
        throw error;
      }
    };
  }

  function reducer(
    state = {
      fields,
      endpoint,
      method,
      errors: {},
      error: null,
      submitting: false,
    },
    action,
  ) {
    switch (action.type) {
      case UPDATE_FIELD_VALUE: {
        const { name, value } = action.payload;
        return { ...state, fields: { ...state.fields, [name]: value } };
      }
      case RESET_FIELD_VALUE: {
        const { name } = action.payload;
        return {
          ...state,
          fields: { ...state.fields, [name]: initialFields[name] },
        };
      }
      case UPDATE_FIELD_VALUES: {
        const allowedFields = pickBy(
          action.payload,
          (v, k) => !isNullOrUndefined(v) && formFields.includes(k),
        );
        return { ...state, fields: { ...state.fields, ...allowedFields } };
      }
      case RESET_FIELD_VALUES: {
        return { ...state, fields: { ...initialFields } };
      }
      case UPDATE_FIELD_ERROR: {
        const { name, error } = action.payload;
        return { ...state, errors: { ...state.errors, [name]: error } };
      }
      case UPDATE_FIELD_ERRORS: {
        const allowedErrors = pickBy(
          action.payload,
          (v, k) => !isNullOrUndefined(v) && formFields.includes(k),
        );
        return { ...state, errors: { ...state.errors, ...allowedErrors } };
      }
      // Below action also resets form level error
      case RESET_FIELD_ERRORS: {
        return { ...state, errors: {}, error: null };
      }
      // Call below action with payload as `null` to reset only form level error
      case UPDATE_FORM_ERROR: {
        return { ...state, error: action.payload };
      }
      case SET_SUBMITTING: {
        return { ...state, submitting: action.payload };
      }
      default: {
        return { ...state };
      }
    }
  }

  return {
    actions: {
      resetErrors,
      resetField,
      resetFields,
      submitForm,
      updateField,
      updateFieldError,
      updateFieldErrors,
      updateFields,
    },
    actionTypes: {
      RESET_FIELD_ERRORS,
      RESET_FIELD_VALUES,
      SET_SUBMITTING,
      UPDATE_FIELD_ERROR,
      UPDATE_FIELD_ERRORS,
      UPDATE_FIELD_VALUE,
      UPDATE_FIELD_VALUES,
    },
    reducer,
  };
}
