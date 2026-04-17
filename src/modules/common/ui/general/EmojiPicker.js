import React from 'react';

import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

export const EMOJI_SIZE = 20;

function EmojiPicker(props) {
  return (
    <Picker
      data={data}
      emojiSize={EMOJI_SIZE}
      skinTonePosition="none"
      previewPosition="none"
      {...props}
    />
  );
}

export default EmojiPicker;
