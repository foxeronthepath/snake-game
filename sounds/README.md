# Audio Files for Snake Game

This folder should contain the following audio files in WAV format:

## Required Audio Files:

1. **eat.wav** - Sound effect when the snake eats food

   * Should be a short, pleasant sound (0.5-1 second)
   * Suggested: coin pickup, bite, or eating sound

2. **death.wav** - Sound effect when the snake dies/crashes

   * Should be a short, impactful sound (1-2 seconds)
   * Suggested: crash, explosion, or death sound

3. **win.wav** - Sound effect when the player wins the game

   * Should be a celebratory sound (2-4 seconds)
   * Suggested: victory fanfare, applause, or success sound

4. **background.wav** - Background music (optional)

   * Should be a looping music track
   * Suggested: upbeat, retro, or arcade-style music
   * Will loop automatically during gameplay

## Audio Features:

* All sounds are optional - the game will work without them
* The audio system includes volume controls
* Background music can be toggled independently from sound effects
* Audio settings are saved in localStorage
* Modern browsers require user interaction before playing audio

## File Format:

* Use WAV format for best compatibility
* Keep file sizes reasonable (under 1MB each)
* For background music, consider longer loops (30-60 seconds)

## Usage:

Simply place your WAV files in this folder with the exact names listed above. The game will automatically detect and use them when available.

