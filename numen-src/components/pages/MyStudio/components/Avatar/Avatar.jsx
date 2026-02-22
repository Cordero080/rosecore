import React from 'react';

// Avatar component: just give it a name matching your file in src/assets/icons/avatars
function Avatar({ avatar, size = 50 }) {
  // Path to your avatars folder
  const src = `/assets/icons/avatars/${avatar}.png`; // make sure filenames match keys

  return (
    <img
      src={src}
      alt={avatar}
      style={{ width: size, height: size, borderRadius: '50%' }}
    />
  );
}

export default Avatar;
