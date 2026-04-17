import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';

import { copyToClipboard } from '@common/utils/misc';
import { Dropdown, DropdownItem } from '@common/ui/general';
import { IconButton } from '~meetings/ui/general';
import { mobxify } from '~meetings/ui/hoc';
import { toast } from '@common/ui/general/Toast';

function MeetingItem({ homeStore: store, meeting }) {
  const handleAudienceInfoCopy = useCallback(() => {
    const message = `To join the meeting - "${meeting.name}" as audience use `
      + `link: ${meeting.audience_join_link}`;
    copyToClipboard(message);
    toast.show({ message: 'Audience joining info copied to clipboard' });
  }, [meeting.audience_join_link, meeting.name]);

  const handleHostInfoCopy = useCallback(() => {
    const message = `To join the meeting - "${meeting.name}" as host use `
      + `link: ${meeting.host_join_link}`;
    copyToClipboard(message);
    toast.show({ message: 'Host joining info copied to clipboard' });
  }, [meeting.host_join_link, meeting.name]);

  const handleEdit = useCallback(() => {
    store.setEditingSlug(meeting.slug);
  }, [meeting.slug, store]);

  function audienceInfoUi() {
    return (
      <DropdownItem
        onClick={handleAudienceInfoCopy}
      >
        Copy Audience Joining Info
      </DropdownItem>
    );
  }

  function hostInfoUi() {
    return (
      <DropdownItem
        onClick={handleHostInfoCopy}
      >
        Copy Host Joining Info
      </DropdownItem>
    );
  }

  return (
    <div className="meeting-item">
      <div className="meeting-item__info">
        <Link
          className="meeting-item__title link"
          to={`/i/${meeting.slug}`}
        >
          {meeting.name}
        </Link>
      </div>
      <div className="meeting-item__actions">
        <Dropdown
          component={IconButton}
          titleClassName="btn-inverted m-r-10"
          icon="link"
          label="Copy shareable link"
        >
          {audienceInfoUi()}
          {hostInfoUi()}
        </Dropdown>
        <IconButton
          className="btn-inverted"
          label="Edit"
          icon="edit-variant"
          onClick={handleEdit}
        />
      </div>
    </div>
  );
}

export default mobxify('homeStore')(MeetingItem);
