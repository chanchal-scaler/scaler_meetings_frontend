import { createContext } from 'react';

const FormContext = createContext({
  formState: null,
  formActions: null,
});

export default FormContext;
