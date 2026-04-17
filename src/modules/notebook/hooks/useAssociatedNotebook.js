import { useEffect } from 'react';

const ASSOCIATION_TYPE = 'folder';

function useAssociatedNotebook({
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

    window.IBNotebook.updateAssociatedNotebook();

    return () => {
      window.__NOTEBOOKS__.clearAssociation(ASSOCIATION_TYPE);
      window.IBNotebook.resetAssociatedNotebook();
    };
  }, [associateId, associateType, label]);
}

export default useAssociatedNotebook;
