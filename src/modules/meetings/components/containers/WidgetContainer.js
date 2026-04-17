import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

import { AnalyticsBase } from '@common/ui/general';
import { AppBase, MeetingProvider } from '~meetings/ui/base';
import { LoadMeeting } from '~meetings/components';
import { MeetingStatus } from '~meetings/utils/meeting';
import { WidgetDataContext } from '~meetings/hooks/useWidgetData';
import IncomingEvents from '~meetings/components/IncomingEvents';
import layoutStore from '~meetings/stores/layoutStore';
import WithWidgetStatus from '~meetings/ui/WithWidgetStatus';

function WidgetContainer({
  children, slug, status, headerLeftActions,
  headerRightActions,
  onEndCallRequest,
  missingBookmarkActionRenderer,
  onTestSetupRequest,
}) {
  const widgetData = useMemo(() => ({
    slug,
    status,
    headerLeftActions,
    onEndCallRequest,
    headerRightActions,
    missingBookmarkActionRenderer,
    onTestSetupRequest,
  }), [slug, status, headerLeftActions,
    headerRightActions,
    onEndCallRequest,
    missingBookmarkActionRenderer,
    onTestSetupRequest,
  ]);

  useEffect(() => {
    layoutStore.setIsWidget(true);

    return () => layoutStore.setIsWidget(false);
  }, []);

  return (
    <AnalyticsBase app="drona">
      <WidgetDataContext.Provider value={widgetData}>
        <MeetingProvider>
          <AppBase>
            <div className="layout m-layout">
              <div className="layout__content m-layout__content m-widget">
                <LoadMeeting slug={slug}>
                  {() => (
                    <IncomingEvents>
                      {
                        () => (
                          <WithWidgetStatus>
                            {children}
                          </WithWidgetStatus>
                        )
                      }
                    </IncomingEvents>
                  )}
                </LoadMeeting>
              </div>
            </div>
          </AppBase>
        </MeetingProvider>
      </WidgetDataContext.Provider>
    </AnalyticsBase>
  );
}

WidgetContainer.propTypes = {
  children: PropTypes.func.isRequired,
  slug: PropTypes.string.isRequired,
  status: PropTypes.oneOf(Object.values(MeetingStatus)),
};

export default WidgetContainer;
