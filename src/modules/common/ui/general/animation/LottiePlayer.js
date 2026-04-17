import React from 'react';
import '@dotlottie/player-component';

export default function LottieAnimation(props) {
  return (
    <dotlottie-player
      autoPlay
      loop
      mode="normal"
      {...props}
    />
  );
}
