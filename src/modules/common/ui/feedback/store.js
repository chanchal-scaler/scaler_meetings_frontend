export const ActionTypes = {
  UPDATE_FIELD: 'feedback/UPDATE_FIELD',
  RESET_FIELDS: 'feedback/RESET_FIELDS',
  SET_SUBMIT_INIT: 'feedback/SET_SUBMIT_INIT',
  SET_SUBMIT_DONE: 'feedback/SET_SUBMIT_DONE',
  SET_SUBMIT_ERROR: 'feedback/SET_SUBMIT_ERROR',
};

const defaultValues = {
  rating: 0,
  text: '',
};

export function getInitialState(forms) {
  const defaultFields = {};
  forms.forEach(form => {
    const name = `field_${form.id}`;
    const value = defaultValues[form.form_type];
    defaultFields[name] = value;
  });
  return {
    defaultFields,
    fields: defaultFields,
    isSubmitting: false,
    isSubmitted: false,
    submitError: null,
  };
}

export default function reducer(state, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_FIELD: {
      const { payload } = action;
      const fields = { ...state.fields };
      fields[payload.name] = payload.value;
      return { ...state, fields };
    }
    case ActionTypes.RESET_FIELDS: {
      const fields = { ...state.defaultFields };
      return { ...state, fields };
    }
    case ActionTypes.SET_SUBMIT_INIT:
      return { ...state, isSubmitting: true, submitError: null };
    case ActionTypes.SET_SUBMIT_DONE:
      return { ...state, isSubmitting: false, isSubmitted: true };
    case ActionTypes.SET_SUBMIT_ERROR:
      return { ...state, isSubmitting: false, submitError: action.payload };
    default:
      return state;
  }
}
