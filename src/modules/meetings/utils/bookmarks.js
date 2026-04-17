export const canAddMissingBookmark = (type) => {
  switch (type) {
    case 'ComposedVideo':
      return false;
    default:
      return true;
  }
};
