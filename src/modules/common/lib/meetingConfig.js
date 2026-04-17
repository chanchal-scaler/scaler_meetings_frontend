const parseJsonEnv = (value, fallback) => {
  if (!value) return fallback;

  try {
    return JSON.parse(value);
  } catch (_error) {
    return fallback;
  }
};

const createDefaultMeetingConfig = () => ({
  providers: {
    agora: {
      appId: import.meta.env.VITE_MEETING_AGORA_APP_ID
        || '52268d342eee4dcd8f1b5be289a9d909',
    },
  },
  settings: parseJsonEnv(
    import.meta.env.VITE_MEETING_SETTINGS,
    {
      agora: {
        video_broadcasting: {
          screen_mode: 'rtc',
          screen_profile: '720p_1',
          screen_attributes: null,
          audio_profile: 'speech_standard',
        },
      },
    },
  ),
  agora_recording_config: parseJsonEnv(
    import.meta.env.VITE_MEETING_AGORA_RECORDING_CONFIG,
    {
      video_configuration: {
        width: 1280,
        height: 720,
        fps: 30,
        bitrate: 3000,
        background_color: '#000000',
      },
      idle_time: 600,
      channel_type: 1,
    },
  ),
  questionRateLimitTimeout: import.meta.env.VITE_MEETING_QUESTION_RATE_LIMIT_TIMEOUT
    || '180',
});

export const ensureMeetingConfig = () => {
  const defaultConfig = createDefaultMeetingConfig();
  const currentConfig = window.__MEETING_CONFIG__ || {};

  window.__MEETING_CONFIG__ = {
    ...defaultConfig,
    ...currentConfig,
    providers: {
      ...defaultConfig.providers,
      ...(currentConfig.providers || {}),
      agora: {
        ...defaultConfig.providers.agora,
        ...(currentConfig.providers?.agora || {}),
      },
    },
    settings: currentConfig.settings || defaultConfig.settings,
    agora_recording_config: currentConfig.agora_recording_config
      || defaultConfig.agora_recording_config,
    questionRateLimitTimeout: currentConfig.questionRateLimitTimeout
      || defaultConfig.questionRateLimitTimeout,
  };

  return window.__MEETING_CONFIG__;
};
