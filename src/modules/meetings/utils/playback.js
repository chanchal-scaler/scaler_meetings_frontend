export const PlaybackStates = {
  playing: 'playing',
  paused: 'paused',
};

export function canShareVideo(type) {
  return ['conference', 'lecture_hall', 'webinar'].includes(type);
}
