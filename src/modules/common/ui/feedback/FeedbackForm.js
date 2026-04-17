import React, { useCallback } from 'react';
import classNames from 'classnames';

import { Field } from '@common/ui/form';
import { Rating, Tappable, Textarea } from '@common/ui/general';
import { useActions, useGlobalState } from './hooks';

function FeedbackForm({ className, ...remainingProps }) {
  const { fields, forms, isSubmitting } = useGlobalState();
  const { setFieldValue, submitFeedback } = useActions();

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setFieldValue(name, value);
  }, [setFieldValue]);

  function inputUi(field) {
    const name = `field_${field.id}`;
    const value = fields[name];
    switch (field.form_type) {
      case 'rating':
        return (
          <Rating
            className="full-width"
            isLarge
            name={name}
            onChange={handleChange}
            starCount={field.meta.end}
            value={value}
          />
        );
      default:
        return (
          <Textarea
            onChange={handleChange}
            minRows={2}
            name={name}
            required={field.required}
            value={value}
          />
        );
    }
  }

  function fieldUi(field, index) {
    return (
      <Field
        key={index}
        hint={field.description}
        label={field.title}
        required={field.required}
      >
        {inputUi(field)}
      </Field>
    );
  }

  return (
    <form
      className={classNames(
        'form feedback',
        { [className]: className },
      )}
      onSubmit={submitFeedback}
      {...remainingProps}
    >
      {forms.map(fieldUi)}
      <Tappable
        className="btn btn-primary full-width"
        component="button"
        disabled={isSubmitting}
        type="submit"
      >
        Submit Feedback
      </Tappable>
    </form>
  );
}

export default FeedbackForm;
