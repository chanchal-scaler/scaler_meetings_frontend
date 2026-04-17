import React from 'react';

import { HintLayout } from '@common/ui/layouts';
import { mobxify } from '~meetings/ui/hoc';
import { Tappable, Tooltip } from '@common/ui/general';
import PollErrors from './PollErrors';
import PollForm from './PollForm';
import PollTrailer from './PollTrailer';

function PollList({ pollStore: store }) {
  function itemUi(poll) {
    if (store.editingPoll && poll.id === store.editingPoll.id) {
      return (
        <div
          key={poll.id}
          className="mcq-hq-list__editing"
        >
          <PollForm name={poll.name}>
            <div className="row">
              <Tooltip
                className="btn btn-primary btn-tooltip m-btn-cta m-r-10"
                component={Tappable}
                disabled={!store.canSubmit || store.isSubmitting}
                isDisabled={store.canSubmit}
                onClick={() => store.update()}
                title={<PollErrors />}
              >
                Update Poll
              </Tooltip>
              <Tappable
                className="btn btn-primary btn-outlined"
                disabled={store.isSubmitting}
                onClick={() => store.setEditingPoll(null)}
              >
                Cancel
              </Tappable>
            </div>
          </PollForm>
        </div>
      );
    } else {
      return (
        <PollTrailer
          key={poll.id}
          className="m-v-10"
          poll={poll}
        />
      );
    }
  }

  if (store.pollCount > 0) {
    return (
      <div className="mcq-hq-list">
        {store.pollList.map(itemUi)}
      </div>
    );
  } else {
    return (
      <HintLayout
        message="There are no polls added to this meeting"
      />
    );
  }
}

export default mobxify('pollStore')(PollList);
