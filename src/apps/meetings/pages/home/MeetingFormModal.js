import React, { useCallback, useEffect, useState } from 'react';

import { Field } from '@common/ui/form';
import { mobxify } from '~meetings/ui/hoc';
import { Modal, SwitchRow, Tappable } from '@common/ui/general';
import { toast } from '@common/ui/general/Toast';

function MeetingFormModal({ homeStore: store }) {
  const [name, setName] = useState('');
  const [needPassword, setNeedPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [hostPassword, setHostPassword] = useState('');

  const isOpen = Boolean(store.editingSlug) || store.isCreateModalOpen;
  const editingSlug = store.editingSlug;

  let mode = 'create';
  if (store.editingMeeting) {
    mode = 'update';
  }

  const handleReset = useCallback(() => {
    setName('');
    setNeedPassword(false);
    setPassword('');
    setHostPassword('');
  }, []);

  useEffect(() => {
    if (editingSlug && store.editingMeeting) {
      const meeting = store.editingMeeting;
      setName(meeting.name);
      setHostPassword(meeting.host_password);
      if (meeting.audience_password) {
        setPassword(meeting.audience_password);
        setNeedPassword(true);
      } else {
        setPassword('');
        setNeedPassword(false);
      }
    } else {
      handleReset();
    }
  }, [editingSlug, handleReset, store]);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();

    const json = {
      name,
      host_password: hostPassword,
    };
    if (needPassword) {
      json.audience_password = password;
    } else {
      json.audience_password = '';
    }

    try {
      if (mode === 'create') {
        await store.createMeeting(json);
        toast.show({
          message: 'Meeting created successfully',
          type: 'success',
        });
      } else {
        await store.updateMeeting(json);
        toast.show({
          message: 'Meeting updated successfully',
          type: 'success',
        });
      }
    } catch (error) {
      let message = 'Failed to create meeting';
      if (mode === 'update') {
        message = 'Failed to update meeting';
      }
      toast.show({ message, type: 'error' });
    }
  }, [hostPassword, mode, name, needPassword, password, store]);

  const handleModalClose = useCallback(() => {
    store.setEditingSlug(null);
    store.setCreateModalOpen(false);
  }, [store]);

  function buttonLabel() {
    let label = 'Create Meeting';
    if (mode === 'update') {
      label = 'Update Meeting';
    }
    return label;
  }

  function titleUi() {
    switch (mode) {
      case 'update':
        return `Edit - ${store.editingMeeting.name}`;
      case 'create':
        return 'Create Meeting';
      default:
        return null;
    }
  }

  function nameUi() {
    return (
      <Field
        label="Name"
        required
      >
        <input
          onChange={event => setName(event.target.value)}
          type="text"
          value={name}
        />
      </Field>
    );
  }

  function hostPasswordUi() {
    return (
      <Field
        label="Host Password"
        required
      >
        <input
          onChange={event => setHostPassword(event.target.value)}
          type="text"
          value={hostPassword}
        />
      </Field>
    );
  }

  function needPasswordUi() {
    return (
      <SwitchRow
        className="form-field"
        label="Enable Audience Password"
        hint="If enabled users will need to enter password to join as audience"
        onChange={event => setNeedPassword(event.target.checked)}
        checked={needPassword}
      />
    );
  }

  function passwordUi() {
    if (needPassword) {
      return (
        <Field label="Audience Password">
          <input
            onChange={event => setPassword(event.target.value)}
            type="text"
            value={password}
          />
        </Field>
      );
    } else {
      return null;
    }
  }

  function submitUi() {
    return (
      <Tappable
        className="btn btn-primary full-width"
        component="button"
        disabled={store.isSubmitting}
        type="submit"
      >
        {buttonLabel()}
      </Tappable>
    );
  }

  function formUi() {
    return (
      <form
        className="form"
        onSubmit={handleSubmit}
      >
        {nameUi()}
        {hostPasswordUi()}
        {needPasswordUi()}
        {passwordUi()}
        {submitUi()}
      </form>
    );
  }

  return (
    <Modal
      onClose={handleModalClose}
      isOpen={isOpen}
      title={titleUi()}
    >
      {formUi()}
    </Modal>
  );
}

export default mobxify('homeStore')(MeetingFormModal);
