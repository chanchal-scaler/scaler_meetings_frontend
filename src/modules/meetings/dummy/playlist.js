const dummyPlaylist = {
  playlist: {
    id: 1,
    name: 'Playlist Default',
    playlist_content_ids: [1, 2, 3],
  },
  playlist_contents: {
    1: {
      name: 'Python 1',
      order: 0,
      content_type: 'Content Type',
      content_id: 1,
      played_count: 0,
      description: 'Video Desc 1',
      duration: 60,
      videos: [
        {
          video_id: 1,
          type: 'screen',
          // eslint-disable-next-line max-len
          url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        },
        {
          video_id: 2,
          type: 'av',
          // eslint-disable-next-line max-len
          url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        },
      ],
    },
    2: {
      name: 'Python 2',
      order: 1,
      content_type: 'Content Type',
      content_id: 2,
      played_count: 0,
      description: 'Video Desc 2',
      duration: 60,
      videos: [
        {
          video_id: 1,
          type: 'screen',
          // eslint-disable-next-line max-len
          url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        },
        {
          video_id: 2,
          type: 'av',
          // eslint-disable-next-line max-len
          url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        },
      ],
    },
    3: {
      name: 'Python 3',
      order: 2,
      content_type: 'Content Type',
      content_id: 3,
      played_count: 0,
      description: 'Video Desc 3',
      duration: 1024,
      videos: [
        {
          video_id: 1,
          type: 'screen',
          // eslint-disable-next-line max-len
          url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        },
        {
          video_id: 2,
          type: 'av',
          // eslint-disable-next-line max-len
          url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        },
      ],
    },
  },
};

export default dummyPlaylist;
