import SurveyBaseField from './surveyBaseField';

class NormalInputField extends SurveyBaseField {
  fieldData = null;

  constructor(data) {
    super();
    this.fieldData = data;
  }

  onSelectValue = (value) => {
    const formId = this.fieldData.id;
    this.update(value, formId);
  }
}

export default NormalInputField;
