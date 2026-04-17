import { useEffect } from 'react';

const ASSOCIATION_TYPE = 'file';

function useAssociatedNote({
  associateId,
  associateType,
  label,
}) {
  useEffect(() => {
    if (!window.__NOTEBOOKS__ || !window.IBNotebook) return undefined;

    window.__NOTEBOOKS__.updateAssociation({
      type: ASSOCIATION_TYPE,
      associateType,
      associateId,
      label,
    });

    window.IBNotebook.updateAssociatedNote();

    return () => {
      window.__NOTEBOOKS__.clearAssociation(ASSOCIATION_TYPE);
      window.IBNotebook.resetAssociatedNote();
    };
  }, [associateId, associateType, label]);
}

export default useAssociatedNote;
