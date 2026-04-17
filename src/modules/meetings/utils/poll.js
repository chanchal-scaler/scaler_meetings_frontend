export const MIN_DESCRIPTION_LENGTH = 5;

export const MAX_DESCRIPTION_LENGTH = 256;

export const MIN_CHOICE_LENGTH = 1;

export const MAX_CHOICE_LENGTH = 96;

export function isChoiceValid(choice) {
  const value = choice.trim();
  return (
    value.length >= MIN_CHOICE_LENGTH
    && value.length <= MAX_CHOICE_LENGTH
  );
}

export function isDescriptionValid(description) {
  const value = description.trim();
  return (
    value.length >= MIN_DESCRIPTION_LENGTH
    && value.length <= MAX_DESCRIPTION_LENGTH
  );
}
