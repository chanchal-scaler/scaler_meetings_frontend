import { useContext } from 'react';

import { FeedbackStateContext, FeedbackActionsContext } from './context';

export function useGlobalState() {
  return useContext(FeedbackStateContext);
}

export function useActions() {
  return useContext(FeedbackActionsContext);
}
