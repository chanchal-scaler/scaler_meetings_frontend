import { PLAYLIST_CONTENT_TYPES } from '~meetings/utils/playlist';
import ComposedVideoContent from './composedVideoContent';
import CueCardContent from './cueCardContent';
import ProblemContent from './problemContent';

class PlaylistContentFactory {
  static contentClassMapping = {
    [PLAYLIST_CONTENT_TYPES.alumniCard]: CueCardContent,
    [PLAYLIST_CONTENT_TYPES.composedVideo]: ComposedVideoContent,
    [PLAYLIST_CONTENT_TYPES.cueCard]: CueCardContent,
    [PLAYLIST_CONTENT_TYPES.instructorCard]: CueCardContent,
    [PLAYLIST_CONTENT_TYPES.poll]: ProblemContent,
    [PLAYLIST_CONTENT_TYPES.problem]: ProblemContent,
    [PLAYLIST_CONTENT_TYPES.htmlCard]: CueCardContent,
  }

  static createInstance(playlist, data) {
    const { card_type: type } = data;
    const ContentClass = PlaylistContentFactory.contentClassMapping[type];
    return new ContentClass(playlist, data);
  }
}

export default PlaylistContentFactory;
