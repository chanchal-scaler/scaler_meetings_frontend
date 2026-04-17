/* eslint-disable camelcase */
export const AGORA_RECORDING_CONFIG = window
                                      ?.__MEETING_CONFIG__
                                      ?.agora_recording_config;

export const VIDEO_CONFIG = AGORA_RECORDING_CONFIG?.video_configuration;
