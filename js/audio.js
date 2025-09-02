// Audio Manager for Snake Game
class AudioManager {
  constructor() {
    this.sounds = {};
    this.backgroundMusic = null;
    this.enabled = true;
    this.musicEnabled = true;
    this.volume = 0.7;
    this.musicVolume = 0.3;
    
    // Initialize audio files
    this.initializeSounds();
    
    // Load settings from localStorage
    this.loadSettings();
  }

  // Initialize all sound effects and background music
  initializeSounds() {
    try {
      // Sound effects
      this.sounds.eat = new Audio('./sounds/eat.wav');
      this.sounds.death = new Audio('./sounds/death.wav');
      this.sounds.win = new Audio('./sounds/win.wav');
      
      // Background music
      this.backgroundMusic = new Audio('./sounds/background.wav');
      this.backgroundMusic.loop = true;
      
      // Set initial volumes
      this.updateVolumes();
      
      // Add error handling for each audio file
      Object.values(this.sounds).forEach(sound => {
        sound.addEventListener('error', (e) => {
          console.warn(`Failed to load sound: ${e.target.src}`);
        });
      });
      
      if (this.backgroundMusic) {
        this.backgroundMusic.addEventListener('error', (e) => {
          console.warn(`Failed to load background music: ${e.target.src}`);
        });
      }
      
      console.log('Audio system initialized successfully');
    } catch (error) {
      console.warn('Audio initialization failed:', error);
      this.enabled = false;
    }
  }

  // Update volumes for all audio
  updateVolumes() {
    Object.values(this.sounds).forEach(sound => {
      sound.volume = this.volume;
    });
    
    if (this.backgroundMusic) {
      this.backgroundMusic.volume = this.musicVolume;
    }
  }

  // Play a sound effect
  playSound(soundName) {
    if (!this.enabled || !this.sounds[soundName]) {
      return;
    }
    
    try {
      const sound = this.sounds[soundName];
      sound.currentTime = 0; // Reset to beginning
      sound.play().catch(error => {
        console.warn(`Failed to play sound ${soundName}:`, error);
      });
    } catch (error) {
      console.warn(`Error playing sound ${soundName}:`, error);
    }
  }

  // Play background music
  playBackgroundMusic() {
    if (!this.musicEnabled || !this.backgroundMusic) {
      return;
    }
    
    try {
      this.backgroundMusic.currentTime = 0;
      this.backgroundMusic.play().catch(error => {
        console.warn('Failed to play background music:', error);
      });
    } catch (error) {
      console.warn('Error playing background music:', error);
    }
  }

  // Stop background music
  stopBackgroundMusic() {
    if (this.backgroundMusic) {
      try {
        this.backgroundMusic.pause();
        this.backgroundMusic.currentTime = 0;
      } catch (error) {
        console.warn('Error stopping background music:', error);
      }
    }
  }

  // Pause background music
  pauseBackgroundMusic() {
    if (this.backgroundMusic) {
      try {
        this.backgroundMusic.pause();
      } catch (error) {
        console.warn('Error pausing background music:', error);
      }
    }
  }

  // Resume background music
  resumeBackgroundMusic() {
    if (!this.musicEnabled || !this.backgroundMusic) {
      return;
    }
    
    try {
      this.backgroundMusic.play().catch(error => {
        console.warn('Failed to resume background music:', error);
      });
    } catch (error) {
      console.warn('Error resuming background music:', error);
    }
  }

  // Toggle sound effects on/off
  toggleSounds() {
    this.enabled = !this.enabled;
    this.saveSettings();
    
    if (!this.enabled) {
      // Stop any currently playing sounds
      Object.values(this.sounds).forEach(sound => {
        try {
          sound.pause();
          sound.currentTime = 0;
        } catch (error) {
          // Ignore errors when stopping sounds
        }
      });
    }
    
    console.log(`Sound effects ${this.enabled ? 'enabled' : 'disabled'}`);
    return this.enabled;
  }

  // Toggle background music on/off
  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    this.saveSettings();
    
    if (this.musicEnabled) {
      this.resumeBackgroundMusic();
    } else {
      this.pauseBackgroundMusic();
    }
    
    console.log(`Background music ${this.musicEnabled ? 'enabled' : 'disabled'}`);
    return this.musicEnabled;
  }

  // Set sound effects volume (0.0 to 1.0)
  setSoundVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    this.updateVolumes();
    this.saveSettings();
  }

  // Set background music volume (0.0 to 1.0)
  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    this.updateVolumes();
    this.saveSettings();
  }

  // Get current settings
  getSettings() {
    return {
      soundsEnabled: this.enabled,
      musicEnabled: this.musicEnabled,
      soundVolume: this.volume,
      musicVolume: this.musicVolume
    };
  }

  // Save settings to localStorage
  saveSettings() {
    try {
      const settings = this.getSettings();
      localStorage.setItem('snakeAudioSettings', JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save audio settings:', error);
    }
  }

  // Load settings from localStorage
  loadSettings() {
    try {
      const savedSettings = localStorage.getItem('snakeAudioSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        this.enabled = settings.soundsEnabled !== undefined ? settings.soundsEnabled : true;
        this.musicEnabled = settings.musicEnabled !== undefined ? settings.musicEnabled : true;
        this.volume = settings.soundVolume !== undefined ? settings.soundVolume : 0.7;
        this.musicVolume = settings.musicVolume !== undefined ? settings.musicVolume : 0.3;
        
        this.updateVolumes();
      }
    } catch (error) {
      console.warn('Failed to load audio settings:', error);
    }
  }

  // Convenience methods for specific game events
  playEatSound() {
    this.playSound('eat');
  }

  playDeathSound() {
    this.playSound('death');
  }

  playWinSound() {
    this.playSound('win');
  }

  // Initialize user interaction (required for audio in modern browsers)
  initializeUserInteraction() {
    // This should be called after user interaction (e.g., clicking start button)
    const initAudio = () => {
      try {
        // Try to play a silent sound to initialize audio context
        Object.values(this.sounds).forEach(sound => {
          if (sound.readyState >= 2) { // HAVE_CURRENT_DATA
            const originalVolume = sound.volume;
            sound.volume = 0;
            sound.play().then(() => {
              sound.pause();
              sound.currentTime = 0;
              sound.volume = originalVolume;
            }).catch(() => {
              // Silent fail for initialization
            });
          }
        });
        
        if (this.backgroundMusic && this.backgroundMusic.readyState >= 2) {
          const originalVolume = this.backgroundMusic.volume;
          this.backgroundMusic.volume = 0;
          this.backgroundMusic.play().then(() => {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
            this.backgroundMusic.volume = originalVolume;
          }).catch(() => {
            // Silent fail for initialization
          });
        }
      } catch (error) {
        console.warn('Audio context initialization failed:', error);
      }
    };

    // Try to initialize immediately
    initAudio();
    
    // Also add event listeners for user interaction
    const userInteractionEvents = ['click', 'touchstart', 'keydown'];
    const handleUserInteraction = () => {
      initAudio();
      userInteractionEvents.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };

    userInteractionEvents.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true });
    });
  }
  // Initialize UI controls
  initializeAudioControls() {
    const audioPanelToggle = document.getElementById('audio-panel-toggle');
    const audioPanel = document.getElementById('audio-panel');
    const soundsToggle = document.getElementById('sounds-toggle');
    const musicToggle = document.getElementById('music-toggle');
    const soundsVolume = document.getElementById('sounds-volume');
    const musicVolume = document.getElementById('music-volume');
    const soundsVolumeDisplay = document.getElementById('sounds-volume-display');
    const musicVolumeDisplay = document.getElementById('music-volume-display');

    if (!audioPanelToggle || !audioPanel) {
      console.warn('Audio control elements not found');
      return;
    }

    // Toggle audio panel visibility
    audioPanelToggle.addEventListener('click', () => {
      audioPanel.classList.toggle('hidden');
    });

    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
      if (!audioPanelToggle.contains(e.target) && !audioPanel.contains(e.target)) {
        audioPanel.classList.add('hidden');
      }
    });

    // Sound effects toggle
    if (soundsToggle) {
      soundsToggle.addEventListener('click', () => {
        const enabled = this.toggleSounds();
        soundsToggle.textContent = enabled ? 'ON' : 'OFF';
        soundsToggle.classList.toggle('active', enabled);
        
        // Update button icon
        audioPanelToggle.textContent = (this.enabled || this.musicEnabled) ? '🔊' : '🔇';
      });
    }

    // Background music toggle
    if (musicToggle) {
      musicToggle.addEventListener('click', () => {
        const enabled = this.toggleMusic();
        musicToggle.textContent = enabled ? 'ON' : 'OFF';
        musicToggle.classList.toggle('active', enabled);
        
        // Update button icon
        audioPanelToggle.textContent = (this.enabled || this.musicEnabled) ? '🔊' : '🔇';
      });
    }

    // Sound effects volume slider
    if (soundsVolume && soundsVolumeDisplay) {
      soundsVolume.addEventListener('input', (e) => {
        const volume = e.target.value / 100;
        this.setSoundVolume(volume);
        soundsVolumeDisplay.textContent = `${e.target.value}%`;
      });
    }

    // Background music volume slider
    if (musicVolume && musicVolumeDisplay) {
      musicVolume.addEventListener('input', (e) => {
        const volume = e.target.value / 100;
        this.setMusicVolume(volume);
        musicVolumeDisplay.textContent = `${e.target.value}%`;
      });
    }

    // Initialize UI state from current settings
    this.updateUIFromSettings();
  }

  // Update UI elements to match current audio settings
  updateUIFromSettings() {
    const soundsToggle = document.getElementById('sounds-toggle');
    const musicToggle = document.getElementById('music-toggle');
    const soundsVolume = document.getElementById('sounds-volume');
    const musicVolume = document.getElementById('music-volume');
    const soundsVolumeDisplay = document.getElementById('sounds-volume-display');
    const musicVolumeDisplay = document.getElementById('music-volume-display');
    const audioPanelToggle = document.getElementById('audio-panel-toggle');

    if (soundsToggle) {
      soundsToggle.textContent = this.enabled ? 'ON' : 'OFF';
      soundsToggle.classList.toggle('active', this.enabled);
    }

    if (musicToggle) {
      musicToggle.textContent = this.musicEnabled ? 'ON' : 'OFF';
      musicToggle.classList.toggle('active', this.musicEnabled);
    }

    if (soundsVolume && soundsVolumeDisplay) {
      const volumePercent = Math.round(this.volume * 100);
      soundsVolume.value = volumePercent;
      soundsVolumeDisplay.textContent = `${volumePercent}%`;
    }

    if (musicVolume && musicVolumeDisplay) {
      const volumePercent = Math.round(this.musicVolume * 100);
      musicVolume.value = volumePercent;
      musicVolumeDisplay.textContent = `${volumePercent}%`;
    }

    if (audioPanelToggle) {
      audioPanelToggle.textContent = (this.enabled || this.musicEnabled) ? '🔊' : '🔇';
    }
  }
}

// Create global audio manager instance
const audioManager = new AudioManager();

// Make it available globally
window.audioManager = audioManager;

// Initialize user interaction handling when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  audioManager.initializeUserInteraction();
  audioManager.initializeAudioControls();
});
