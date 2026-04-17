class LocalStreamUser {
  constructor({
    uid, audioTrack, videoTrack, audioMuted = false, videoMuted = false,
  }) {
    this.uid = uid;
    this.audioTrack = audioTrack;
    this.videoTrack = videoTrack;
    this._audioMuted = audioMuted;
    this._videoMuted = videoMuted;
  }

  get hasAudio() {
    return this.audioTrack && !this._audioMuted;
  }

  get hasVideo() {
    return this.videoTrack && !this._videoMuted;
  }
}

export default LocalStreamUser;
