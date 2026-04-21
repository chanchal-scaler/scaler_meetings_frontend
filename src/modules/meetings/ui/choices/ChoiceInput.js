import React, { useCallback, useEffect, useRef } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import { Icon, Tappable, Textarea } from '@common/ui/general';

function ChoiceInput({
  canDelete = true,
  canMarkCorrect = true,
  className,
  index,
  isCorrect = false,
  onChange,
  onDelete,
  onMarkAsCorrect,
  shouldFocus,
  value,
}) {
  const ref = useRef(null);
  useEffect(() => {
    if (shouldFocus && ref.current) {
      ref.current.focus();
    }
  }, [shouldFocus]);

  const handleDelete = useCallback(() => {
    if (canDelete) {
      onDelete(index);
    }
  }, [canDelete, index, onDelete]);

  const handleMarkCorrect = useCallback(() => {
    onMarkAsCorrect(index);
  }, [index, onMarkAsCorrect]);

  const handleChange = useCallback((event) => {
    onChange(event.target.value, index);
  }, [index, onChange]);

  function correctUi() {
    if (canMarkCorrect) {
      return (
        <Tappable
          className="choice-input__answer"
          onClick={handleMarkCorrect}
        >
          {isCorrect && <Icon name="check" />}
        </Tappable>
      );
    } else {
      return null;
    }
  }

  function textUi() {
    return (
      <div className="choice-input__text">
        <div className="choice-input__name">
          {String.fromCharCode(65 + index)}
        </div>
        <div className="choice-input__value">
          <Textarea
            ref={ref}
            maxRows={1}
            onChange={handleChange}
            placeholder="Enter choice text"
            value={value}
          />
        </div>
      </div>
    );
  }

  function deleteUi() {
    return (
      <Tappable
        className={classNames(
          'btn btn-inverted btn-icon choice-input__delete',
          { invisible: !canDelete },
        )}
        onClick={handleDelete}
      >
        <Icon name="trash" />
      </Tappable>
    );
  }

  return (
    <div
      className={classNames(
        'choice-input',
        { 'choice-input--correct': isCorrect },
        { [className]: className },
      )}
    >
      {correctUi()}
      {textUi()}
      {deleteUi()}
    </div>
  );
}

ChoiceInput.propTypes = {
  canDelete: PropTypes.bool,
  index: PropTypes.number,
  isCorrect: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
};

export default ChoiceInput;
