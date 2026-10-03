# ElevenLabs Voice Studio 🎙️

An AI Speech Narration web application powered directly by ElevenLabs' Text-to-Speech API.

## Features

- **Text Narration Input**: Large interactive text area with live character counting, word duration estimation, and one-click paste & clear buttons.
- **Model Selector Dropdown**: Switch dynamically between ElevenLabs narration models:
  - **Eleven Multilingual v2**: Rich, emotionally expressive speech in 29 languages.
  - **Eleven Flash v2.5**: Ultra-low latency and fastest response time.
  - **Eleven Turbo v2.5**: Balance of low latency and natural prosody.
  - **Eleven Turbo v2** & **Eleven English v1**.
- **Voice Selection & Instant Preview**:
  - Dynamically fetches available voices from ElevenLabs with tags for accent, gender, and use-case.
  - One-click voice sample preview to audition voices before generation.
- **Big Hero Play Button**: Starts speech synthesis with loading state and immediate audio playback.
- **Real-Time Waveform Visualizer**: HTML5 Canvas rendering dynamic audio frequency bars during playback via the Web Audio API (`AnalyserNode`).
- **Full Audio Player**:
  - Play/Pause controls with spacebar support
  - Scrubbing seek bar with elapsed and total duration
  - Speed toggle (0.75x, 1x, 1.25x, 1.5x, 2x)
  - Volume control & mute
  - One-click MP3 download
- **Voice Dynamics & Fine Tuning**: Collapsible sliders for Stability, Clarity/Similarity boost, Style exaggeration, and Speaker boost.
- **Sample Prompts Presets**: Instant starter presets (Cinematic Movie Trailer, Storyteller Tale, Tech Podcast, Calm Meditation).
- **Recent Takes History**: Retains your recent generations for instant replay or MP3 export.
- **Live Quota & Tier Monitoring**: Shows your character quota and consumption directly in the header.

## How to Run

1. Open `index.html` directly in your favorite browser (e.g. Chrome, Edge, Firefox), or serve it via any local web server:
   ```bash
   python -m http.server 8080
   ```
2. Navigate to `http://localhost:8080`.
3. Your ElevenLabs API key is pre-configured and ready to use!
