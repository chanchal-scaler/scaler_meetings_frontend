import SurveyBaseField from './surveyBaseField';

class DropdownField extends SurveyBaseField {
  fieldData = null;

  constructor(data) {
    super();
    this.fieldData = data;
  }

  onSelectValue = (index) => {
    const myChoiceIndices = [index];
    const value = this.fieldData.choices[index];
    const formId = this.fieldData.id;
    this.update(value, formId, myChoiceIndices);
  }
}

export default DropdownField;
