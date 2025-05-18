// Utility to play a sound from the public/sounds directory
export function playSound(filename: string) {
  const audio = new Audio(`/sounds/${filename}`);
  audio.currentTime = 0;
  audio.volume = 0.4;
  audio.play();
} 