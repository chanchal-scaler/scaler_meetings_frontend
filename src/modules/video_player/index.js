import {
  Bookmark, ControlItem, Controls, Player, Playlist, PlaylistItem,
} from '~video_player/ui/player';

import './index.scss';

const VideoPlayer = Player;

VideoPlayer.Bookmark = Bookmark;
VideoPlayer.ControlItem = ControlItem;
VideoPlayer.Controls = Controls;
VideoPlayer.Playlist = Playlist;
VideoPlayer.PlaylistItem = PlaylistItem;

export default VideoPlayer;
