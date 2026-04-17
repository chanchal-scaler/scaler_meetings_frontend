import { useContext } from 'react';

import TranslationsContext from '@common/contexts/translationsContext';

const useTranslations = () => useContext(TranslationsContext);

export default useTranslations;
