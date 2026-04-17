export const HEADER_ACTION_TYPE = {
  upcoming: 'upcoming',
  live: 'live',
  archive: 'archive',
  all: 'all',
};

export function getHeaderActions(actions, mode) {
  const modeActions = actions?.[mode] ?? [];
  const allActions = actions?.[HEADER_ACTION_TYPE.all] ?? [];

  return [...allActions, ...modeActions];
}
