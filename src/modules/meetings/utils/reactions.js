export const ReactionTypes = {
  plusOne: 'plus_one',
  minusOne: 'minus_one',
  thinkingFace: 'thinking_face',
};

export const REACTION_LIST = [ReactionTypes.plusOne, ReactionTypes.minusOne];

// Use `MdRenderer` component to render these emojis
export const reactionsEmojiMap = {
  [ReactionTypes.plusOne]: ':+1:',
  [ReactionTypes.minusOne]: ':-1:',
  [ReactionTypes.thinkingFace]: ':thinking_face:',
};

export const reactionsNativeEmojiMap = {
  [ReactionTypes.plusOne]: '👍',
  [ReactionTypes.minusOne]: '👎',
  [ReactionTypes.thinkingFace]: '🤔',
};

export const reactionsTextMap = {
  [ReactionTypes.plusOne]: 'yes',
  [ReactionTypes.minusOne]: 'no',
  [ReactionTypes.thinkingFace]: 'confused',
};

export const MAX_USER_LIMIT = 10;

export const transformData = (data) => {
  const haveReactionsData = data.data !== undefined;
  return {
    reactions: Object.keys(data.reactions).reduce((acc, o) => ({
      ...acc,
      [o]: {
        count: data.reactions[o],
        names: haveReactionsData ? data.data[o].names || [] : [],
      },
    }), {}),
  };
};

export const getLabel = (count, names) => {
  if (names.length === 0) {
    return '';
  }
  let label = '';
  label += names.join(', ');
  if (count - names.length > 0) {
    label += ` and ${count - names.length} more`;
  }
  label += '.';
  return label;
};
