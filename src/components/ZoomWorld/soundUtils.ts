// Utility to play a sound from the public/sounds directory
export function playSound(filename: string) {
  const audio = new Audio(`/sounds/${filename}`);
  audio.currentTime = 0;
  audio.volume = 0.2;
  audio.play();
}

let lastPentatonicIndex: number | null = null;

// Play a random pentatonic note from the public/sounds/pentatonic folder
export function playRandomPentatonicNote() {
  const notes = [
    'pentatonic1.wav',
    'pentatonic2.wav',
    'pentatonic3.wav',
    'pentatonic4.wav'
  ];
  let randomIndex = Math.floor(Math.random() * notes.length);
  // Ensure we don't repeat the same note twice in a row
  if (lastPentatonicIndex !== null && notes.length > 1) {
    while (randomIndex === lastPentatonicIndex) {
      randomIndex = Math.floor(Math.random() * notes.length);
    }
  }
  lastPentatonicIndex = randomIndex;
  playSound(`pentatonic/${notes[randomIndex]}`);
} 