import React, { useEffect } from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react';

import { HintLayout, LoadingLayout } from '@common/ui/layouts';


function LoadPlaylistContent({ content, children, className }) {
  useEffect(() => {
    content.load();
  }, [content]);

  if (content.contentData) {
    return children();
  } else if (content.loadError) {
    return (
      <HintLayout
        className={classNames(
          { [className]: className },
        )}
        message="Failed to load playlist content"
        actionLabel="Try again"
        actionFn={() => content.load()}
      />
    );
  } else {
    return (
      <div className={classNames(
        { [className]: className },
      )}
      >
        <LoadingLayout />
      </div>
    );
  }
}

export default observer(LoadPlaylistContent);
