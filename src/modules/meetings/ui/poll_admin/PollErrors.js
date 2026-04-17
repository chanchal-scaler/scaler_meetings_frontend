import React from 'react';

import { mobxify } from '~meetings/ui/hoc';

function PollErrors({ pollStore: store }) {
  if (store.validationErrors.length > 0) {
    return (
      <div className="col">
        {store.validationErrors.map(
          (message, index) => (
            <div key={index}>
              {index + 1}
              .
              {' '}
              {message}
            </div>
          ),
        )}
      </div>
    );
  } else {
    return null;
  }
}

export default mobxify('pollStore')(PollErrors);
