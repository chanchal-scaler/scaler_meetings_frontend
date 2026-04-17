class SurveyBaseField {
  constructor() {
    this.myChoiceIndices = null;
    this.formResponse = null;
    this.formId = null;
  }

  reset() {
    this.myChoiceIndices = null;
    this.formResponse = null;
    this.formId = null;
  }

  update(value, formId, choiceIndex) {
    this.myChoiceIndices = choiceIndex;
    this.formResponse = value;
    this.formId = formId;
  }
}

export default SurveyBaseField;
