import React from 'react';
import { Navigate, useParams } from 'react-router-dom';

import { canNavigate } from '~meetings/utils/meeting';
import { mobxify } from '~meetings/ui/hoc';
import { useQuery } from '@common/hooks';

const statusRouteMap = {
  upcoming: 'upcoming',
  ongoing: 'live',
  completed: 'archive',
};

function withStatusProtection(status) {
  return (BaseComponent) => {
    function WithStatusProtection({ meetingStore: store, ...remainingProps }) {
      const { forced } = useQuery();
      const { slug } = useParams();
      const { data } = store;
      const isNavigationAllowed = canNavigate(
        data.status,
        status,
        forced === '1' && store.isSuperHost,
      );

      if (isNavigationAllowed) {
        return <BaseComponent {...remainingProps} />;
      } else {
        return (
          <Navigate
            to={`/i/${slug}/${statusRouteMap[data.status]}`}
          />
        );
      }
    }

    return mobxify('meetingStore')(WithStatusProtection);
  };
}

export default withStatusProtection;
