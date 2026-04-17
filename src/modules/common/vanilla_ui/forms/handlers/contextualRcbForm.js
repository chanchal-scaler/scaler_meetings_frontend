function initializeContextualRcbForm({
  contextualForm, initializeInputs, submittedCallback,
}) {
  contextualForm.on('initialize', () => {
    if (initializeInputs) {
      initializeInputs();
    }
  });

  contextualForm.on('submitted', () => {
    submittedCallback();
  });
  contextualForm.initialize();
}

export default {
  initialize: initializeContextualRcbForm,
};
