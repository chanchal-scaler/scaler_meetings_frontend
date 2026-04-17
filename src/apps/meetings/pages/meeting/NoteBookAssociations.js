import { mobxify } from '~meetings/ui/hoc';

import { useAssociatedNote } from '~notebook/hooks';

function NoteBookAssociations({ meetingStore: store }) {
  useAssociatedNote({
    associateType: 'Meeting',
    associateId: store.data?.id,
    label: store.data?.name,
  }, [store]);

  return null;
}

export default mobxify('meetingStore')(NoteBookAssociations);
