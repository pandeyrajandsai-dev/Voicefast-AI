/**
 * ElevenLabs Voice Studio — Client Controller
 */

// Application State
const state = {
  apiKey: localStorage.getItem('eleven_api_key') || 'sk_21af5a7a76c206a05ae9c8952cede3f5f8921640cd192481',
  models: [],
  voices: [],
  selectedModel: 'eleven_multilingual_v2',
  selectedVoiceId: '',
  isPlaying: false,
  currentAudioUrl: null,
  history: [],
  audioContext: null,
  analyser: null,
  audioSource: null,
  animationFrameId: null,
  speeds: [1.0, 1.25, 1.5, 2.0, 0.75],
  currentSpeedIndex: 0
};

// Preset Prompts
const presets = {
  cinematic: "In a world shrouded in forgotten legends, one warrior dares to step into the shadow of the colossal titan. Destiny is not written; it is forged.",
  story: "Deep within the Whispering Woods, an ancient stone gate flickered with violet light. Sarah stepped forward, her lantern revealing carvings of wings that hadn't flown in ten thousand years.",
  podcast: "Welcome back to Tech Frontiers, the show where we decode the breakthroughs shaping tomorrow. Today, we're diving into neural audio and real-time generative speech synthesis.",
  meditation: "Close your eyes, and take a long, deep breath in. Hold it for three seconds. And slowly exhale all tension. Feel your mind settle into effortless calm."
};

// Fallback Voice List if network offline or before API loads
const fallbackVoices = [
  { voice_id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', labels: { accent: 'british', gender: 'male', use_case: 'narrative_story' } },
  { voice_id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', labels: { accent: 'american', gender: 'female', use_case: 'reassuring' } },
  { voice_id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger', labels: { accent: 'american', gender: 'male', use_case: 'conversational' } },
  { voice_id: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Alice', labels: { accent: 'british', gender: 'female', use_case: 'informative' } },
  { voice_id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', labels: { accent: 'american', gender: 'male', use_case: 'social_media' } },
  { voice_id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura', labels: { accent: 'american', gender: 'female', use_case: 'social_media' } },
  { voice_id: 'SAz9YHcvj6GT2YYXdXww', name: 'River', labels: { accent: 'american', gender: 'neutral', use_case: 'conversational' } },
  { voice_id: 'SOYHLrjzK2X1ezoPC6cr', name: 'Harry', labels: { accent: 'american', gender: 'male', use_case: 'characters' } }
];

// Fallback Models List
const fallbackModels = [
  { model_id: 'eleven_multilingual_v2', name: 'Eleven Multilingual v2', description: 'Most lifelike, multilingual, 29 languages.' },
  { model_id: 'eleven_flash_v2_5', name: 'Eleven Flash v2.5', description: 'Ultra-low latency, fastest generation.' },
  { model_id: 'eleven_turbo_v2_5', name: 'Eleven Turbo v2.5', description: 'High quality & speed balance.' },
  { model_id: 'eleven_turbo_v2', name: 'Eleven Turbo v2', description: 'Real-time performance optimized.' },
  { model_id: 'eleven_monolingual_v1', name: 'Eleven English v1', description: 'Classic natural English speech.' }
];

// DOM Elements
const dom = {
  apiKeyInput: document.getElementById('apiKeyInput'),
  saveApiKeyBtn: document.getElementById('saveApiKeyBtn'),
  apiKeyToggleBtn: document.getElementById('apiKeyToggleBtn'),
  apiKeyPanel: document.getElementById('apiKeyPanel'),
  toggleApiKeyVisibility: document.getElementById('toggleApiKeyVisibility'),
  apiStatusBadge: document.getElementById('apiStatusBadge'),
  apiStatusText: document.getElementById('apiStatusText'),
  tierInfoBadge: document.getElementById('tierInfoBadge'),
  usedCharsCount: document.getElementById('usedCharsCount'),
  totalCharsCount: document.getElementById('totalCharsCount'),
  quotaPercent: document.getElementById('quotaPercent'),
  meterFill: document.getElementById('meterFill'),

  modelSelect: document.getElementById('modelSelect'),
  modelHint: document.getElementById('modelHint'),
  modelBadge: document.getElementById('modelBadge'),

  voiceSelect: document.getElementById('voiceSelect'),
  voiceCountBadge: document.getElementById('voiceCountBadge'),
  voiceTagGender: document.getElementById('voiceTagGender'),
  voiceTagStyle: document.getElementById('voiceTagStyle'),
  previewVoiceBtn: document.getElementById('previewVoiceBtn'),

  textInput: document.getElementById('textInput'),
  charCount: document.getElementById('charCount'),
  estDuration: document.getElementById('estDuration'),
  clearBtn: document.getElementById('clearBtn'),
  pasteBtn: document.getElementById('pasteBtn'),
  samplesBtn: document.getElementById('samplesBtn'),
  samplesMenu: document.getElementById('samplesMenu'),

  stabilitySlider: document.getElementById('stabilitySlider'),
  stabilityVal: document.getElementById('stabilityVal'),
  similaritySlider: document.getElementById('similaritySlider'),
  similarityVal: document.getElementById('similarityVal'),
  styleSlider: document.getElementById('styleSlider'),
  styleVal: document.getElementById('styleVal'),
  speakerBoostToggle: document.getElementById('speakerBoostToggle'),

  startNarrationBtn: document.getElementById('startNarrationBtn'),
  actionBtnText: document.getElementById('actionBtnText'),
  actionBtnSub: document.getElementById('actionBtnSub'),
  btnSpinner: document.querySelector('.spinner'),
  btnPlaySvg: document.querySelector('.play-svg'),

  audioElement: document.getElementById('audioElement'),
  playPauseBtn: document.getElementById('playPauseBtn'),
  playPauseIcon: document.getElementById('playPauseIcon'),
  currentTimeLabel: document.getElementById('currentTimeLabel'),
  totalDurationLabel: document.getElementById('totalDurationLabel'),
  seekSlider: document.getElementById('seekSlider'),
  seekBarProgress: document.getElementById('seekBarProgress'),
  speedBtn: document.getElementById('speedBtn'),
  volumeSlider: document.getElementById('volumeSlider'),
  volumeMuteBtn: document.getElementById('volumeMuteBtn'),
  downloadAudioBtn: document.getElementById('downloadAudioBtn'),

  visualizerCanvas: document.getElementById('visualizerCanvas'),
  nowPlayingText: document.getElementById('nowPlayingText'),
  nowPlayingModel: document.getElementById('nowPlayingModel'),

  historyList: document.getElementById('historyList'),
  historyEmpty: document.getElementById('historyEmpty'),
  historyCountTag: document.getElementById('historyCountTag'),
  clearHistoryBtn: document.getElementById('clearHistoryBtn'),

  toastContainer: document.getElementById('toastContainer')
};

// Initialize Application
async function initApp() {
  setupEventListeners();
  setupCanvas();
  renderCanvasIdleWave();

  // Load voices and models
  await fetchUserData();
  await fetchModels();
  await fetchVoices();

  // Fill in default demo prompt
  dom.textInput.value = presets.cinematic;
  updateTextCounters();
}

// Event Listeners Setup
function setupEventListeners() {
  // API Key drawer toggle
  dom.apiKeyToggleBtn.addEventListener('click', () => {
    dom.apiKeyPanel.classList.toggle('open');
  });

  // Toggle API key visibility (password vs text)
  dom.toggleApiKeyVisibility.addEventListener('click', () => {
    const isPassword = dom.apiKeyInput.type === 'password';
    dom.apiKeyInput.type = isPassword ? 'text' : 'password';
  });

  // Save API Key
  dom.saveApiKeyBtn.addEventListener('click', async () => {
    const newKey = dom.apiKeyInput.value.trim();
    if (!newKey) {
      showToast('Please enter an API key', 'error');
      return;
    }
    state.apiKey = newKey;
    localStorage.setItem('eleven_api_key', newKey);
    showToast('API key applied! Refreshing voices and quota...', 'success');
    await fetchUserData();
    await fetchModels();
    await fetchVoices();
  });

  // Model select change
  dom.modelSelect.addEventListener('change', (e) => {
    state.selectedModel = e.target.value;
    updateModelDescription(e.target.value);
  });

  // Voice select change
  dom.voiceSelect.addEventListener('change', (e) => {
    state.selectedVoiceId = e.target.value;
    updateVoiceTags(e.target.value);
  });

  // Voice sample preview
  dom.previewVoiceBtn.addEventListener('click', playVoicePreview);

  // Text input character & estimate counter
  dom.textInput.addEventListener('input', updateTextCounters);

  // Clear button
  dom.clearBtn.addEventListener('click', () => {
    dom.textInput.value = '';
    updateTextCounters();
    dom.textInput.focus();
  });

  // Paste button
  dom.pasteBtn.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        dom.textInput.value = text;
        updateTextCounters();
        showToast('Text pasted from clipboard', 'success');
      }
    } catch {
      showToast('Clipboard permission denied. Please paste manually.', 'error');
    }
  });

  // Sample prompt dropdown toggle
  dom.samplesBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dom.samplesMenu.classList.toggle('show');
  });

  document.addEventListener('click', () => {
    dom.samplesMenu.classList.remove('show');
  });

  // Click on sample prompt
  dom.samplesMenu.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const presetKey = item.getAttribute('data-preset');
      if (presets[presetKey]) {
        dom.textInput.value = presets[presetKey];
        updateTextCounters();
        showToast(`Loaded "${item.querySelector('strong').textContent}" prompt`, 'success');
      }
    });
  });

  // Voice Dynamics Sliders
  dom.stabilitySlider.addEventListener('input', (e) => {
    dom.stabilityVal.textContent = Math.round(e.target.value * 100) + '%';
  });

  dom.similaritySlider.addEventListener('input', (e) => {
    dom.similarityVal.textContent = Math.round(e.target.value * 100) + '%';
  });

  dom.styleSlider.addEventListener('input', (e) => {
    dom.styleVal.textContent = Math.round(e.target.value * 100) + '%';
  });

  // Big Play Button — Main Action
  dom.startNarrationBtn.addEventListener('click', startNarration);

  // Audio Player Events
  dom.playPauseBtn.addEventListener('click', toggleAudioPlayback);

  dom.audioElement.addEventListener('timeupdate', updateAudioProgress);
  dom.audioElement.addEventListener('ended', onAudioEnded);
  dom.audioElement.addEventListener('loadedmetadata', () => {
    dom.totalDurationLabel.textContent = formatTime(dom.audioElement.duration || 0);
  });

  // Seek bar
  dom.seekSlider.addEventListener('input', (e) => {
    if (dom.audioElement.duration) {
      const seekTime = (e.target.value / 100) * dom.audioElement.duration;
      dom.audioElement.currentTime = seekTime;
    }
  });

  // Playback Speed
  dom.speedBtn.addEventListener('click', () => {
    state.currentSpeedIndex = (state.currentSpeedIndex + 1) % state.speeds.length;
    const speed = state.speeds[state.currentSpeedIndex];
    dom.audioElement.playbackRate = speed;
    dom.speedBtn.textContent = speed.toFixed(speed % 1 === 0 ? 1 : 2) + 'x';
  });

  // Volume & Mute
  dom.volumeSlider.addEventListener('input', (e) => {
    dom.audioElement.volume = parseFloat(e.target.value);
  });

  dom.volumeMuteBtn.addEventListener('click', () => {
    dom.audioElement.muted = !dom.audioElement.muted;
    dom.volumeSlider.value = dom.audioElement.muted ? 0 : dom.audioElement.volume;
    dom.volumeMuteBtn.style.opacity = dom.audioElement.muted ? '0.4' : '1';
  });

  // Download Audio
  dom.downloadAudioBtn.addEventListener('click', () => {
    if (!state.currentAudioUrl) {
      showToast('No audio generated yet to download', 'error');
      return;
    }
    const a = document.createElement('a');
    a.href = state.currentAudioUrl;
    a.download = `elevenlabs_narration_${Date.now()}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Downloading MP3...', 'success');
  });

  // Clear History
  dom.clearHistoryBtn.addEventListener('click', () => {
    state.history = [];
    renderHistory();
    showToast('History cleared', 'success');
  });
}

// Fetch User & Quota Details
async function fetchUserData() {
  try {
    const res = await fetch('https://api.elevenlabs.io/v1/user', {
      headers: { 'xi-api-key': state.apiKey }
    });

    if (res.ok) {
      const data = await res.json();
      const sub = data.subscription || {};
      const used = sub.character_count || 0;
      const total = sub.character_limit || 10000;
      const pct = Math.min(100, Math.round((used / total) * 100));

      dom.usedCharsCount.textContent = used.toLocaleString();
      dom.totalCharsCount.textContent = total.toLocaleString();
      dom.quotaPercent.textContent = pct + '%';
      dom.meterFill.style.width = pct + '%';

      const tier = (sub.tier || 'Free').toUpperCase();
      dom.tierInfoBadge.textContent = `${tier}: ${(total - used).toLocaleString()} chars remaining`;
      dom.apiStatusBadge.className = 'api-status-badge';
      dom.apiStatusText.textContent = 'Active';
    } else {
      dom.apiStatusBadge.className = 'api-status-badge';
      dom.apiStatusBadge.style.color = '#ef4444';
      dom.apiStatusText.textContent = 'API Error';
    }
  } catch (err) {
    console.warn('Could not fetch user subscription:', err);
  }
}

// Fetch Models
async function fetchModels() {
  try {
    const res = await fetch('https://api.elevenlabs.io/v1/models', {
      headers: { 'xi-api-key': state.apiKey }
    });

    if (res.ok) {
      const data = await res.json();
      const ttsModels = data.filter(m => m.can_do_text_to_speech);
      if (ttsModels.length > 0) {
        state.models = ttsModels;
        populateModelDropdown(ttsModels);
        return;
      }
    }
  } catch (err) {
    console.warn('Using fallback models:', err);
  }

  // Use fallback models if API call fails
  state.models = fallbackModels;
  populateModelDropdown(fallbackModels);
}

function populateModelDropdown(models) {
  dom.modelSelect.innerHTML = '';
  models.forEach(model => {
    const opt = document.createElement('option');
    opt.value = model.model_id;
    opt.textContent = `${model.name} (${model.model_id})`;
    if (model.model_id === 'eleven_multilingual_v2') {
      opt.selected = true;
    }
    dom.modelSelect.appendChild(opt);
  });
  state.selectedModel = dom.modelSelect.value;
  updateModelDescription(state.selectedModel);
}

function updateModelDescription(modelId) {
  const model = state.models.find(m => m.model_id === modelId);
  if (model && model.description) {
    dom.modelHint.textContent = model.description;
  } else {
    dom.modelHint.textContent = `Selected model: ${modelId}`;
  }

  if (modelId.includes('flash')) {
    dom.modelBadge.textContent = 'Ultra Fast';
    dom.modelBadge.className = 'badge badge-purple';
  } else if (modelId.includes('turbo')) {
    dom.modelBadge.textContent = 'Low Latency';
    dom.modelBadge.className = 'badge';
  } else {
    dom.modelBadge.textContent = 'High Quality';
    dom.modelBadge.className = 'badge';
  }
}

// Fetch Voices
async function fetchVoices() {
  dom.voiceCountBadge.textContent = 'Fetching...';
  try {
    const res = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: { 'xi-api-key': state.apiKey }
    });

    if (res.ok) {
      const data = await res.json();
      const voicesList = data.voices || [];
      if (voicesList.length > 0) {
        state.voices = voicesList;
        populateVoiceDropdown(voicesList);
        dom.voiceCountBadge.textContent = `${voicesList.length} voices`;
        return;
      }
    }
  } catch (err) {
    console.warn('Voices API call failed, using fallbacks:', err);
  }

  // Fallbacks
  state.voices = fallbackVoices;
  populateVoiceDropdown(fallbackVoices);
  dom.voiceCountBadge.textContent = `${fallbackVoices.length} voices`;
}

function populateVoiceDropdown(voices) {
  dom.voiceSelect.innerHTML = '';
  voices.forEach((voice, idx) => {
    const opt = document.createElement('option');
    opt.value = voice.voice_id;

    const labels = voice.labels || {};
    const gender = labels.gender || '';
    const accent = labels.accent || '';
    const desc = [accent, gender].filter(Boolean).join(', ');

    opt.textContent = `${voice.name} ${desc ? '— (' + desc + ')' : ''}`;
    if (idx === 0) opt.selected = true;
    dom.voiceSelect.appendChild(opt);
  });

  state.selectedVoiceId = dom.voiceSelect.value;
  updateVoiceTags(state.selectedVoiceId);
}

function updateVoiceTags(voiceId) {
  const voice = state.voices.find(v => v.voice_id === voiceId);
  if (!voice) return;

  const labels = voice.labels || {};
  const gender = labels.gender ? (labels.gender.charAt(0).toUpperCase() + labels.gender.slice(1)) : 'Voice Actor';
  const accent = labels.accent ? (labels.accent.charAt(0).toUpperCase() + labels.accent.slice(1)) : '';
  const useCase = labels.use_case ? labels.use_case.replace(/_/g, ' ') : (labels.descriptive || 'Narration');

  dom.voiceTagGender.textContent = [accent, gender].filter(Boolean).join(' ') || 'Standard Voice';
  dom.voiceTagStyle.textContent = useCase;

  // Check preview audio availability
  dom.previewVoiceBtn.style.display = voice.preview_url ? 'inline-flex' : 'none';
}

// Play Voice Sample Preview
function playVoicePreview() {
  const voice = state.voices.find(v => v.voice_id === state.selectedVoiceId);
  if (!voice || !voice.preview_url) {
    showToast('No preview audio available for this voice', 'error');
    return;
  }

  const previewAudio = new Audio(voice.preview_url);
  previewAudio.play()
    .then(() => {
      showToast(`Playing sample preview for ${voice.name}`, 'success');
    })
    .catch(() => {
      showToast('Could not play sample preview', 'error');
    });
}

// Text Counters & Duration Calculation
function updateTextCounters() {
  const text = dom.textInput.value.trim();
  const len = text.length;
  dom.charCount.textContent = len.toLocaleString();

  // Average reading speed: ~15 characters per second
  const words = text ? text.split(/\s+/).length : 0;
  const estimatedSeconds = Math.max(1, Math.round(words / 2.5));

  if (len === 0) {
    dom.estDuration.textContent = '0s';
  } else if (estimatedSeconds < 60) {
    dom.estDuration.textContent = `${estimatedSeconds}s`;
  } else {
    const mins = Math.floor(estimatedSeconds / 60);
    const secs = estimatedSeconds % 60;
    dom.estDuration.textContent = `${mins}m ${secs}s`;
  }
}

// Start Narration — Main ElevenLabs API Call
async function startNarration() {
  const text = dom.textInput.value.trim();
  if (!text) {
    showToast('Please type or paste some text content to narrate', 'error');
    dom.textInput.focus();
    return;
  }

  const voiceId = dom.voiceSelect.value;
  const modelId = dom.modelSelect.value;

  if (!voiceId) {
    showToast('Please select a voice', 'error');
    return;
  }

  // Set Loading UI
  setLoadingState(true);

  const voiceSettings = {
    stability: parseFloat(dom.stabilitySlider.value),
    similarity_boost: parseFloat(dom.similaritySlider.value),
    style: parseFloat(dom.styleSlider.value),
    use_speaker_boost: dom.speakerBoostToggle.checked
  };

  try {
    const endpoint = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    const payload = {
      text: text,
      model_id: modelId,
      voice_settings: voiceSettings
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'xi-api-key': state.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      let errorMsg = `API Error (${response.status})`;
      try {
        const errJson = await response.json();
        if (errJson.detail && errJson.detail.message) {
          errorMsg = errJson.detail.message;
        } else if (errJson.message) {
          errorMsg = errJson.message;
        }
      } catch {
        errorMsg = await response.text();
      }
      throw new Error(errorMsg);
    }

    // Audio received as binary blob
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    // Save to State
    state.currentAudioUrl = audioUrl;

    const selectedVoiceObj = state.voices.find(v => v.voice_id === voiceId);
    const voiceName = selectedVoiceObj ? selectedVoiceObj.name : 'Voice';
    const selectedModelObj = state.models.find(m => m.model_id === modelId);
    const modelName = selectedModelObj ? selectedModelObj.name : modelId;

    // Update Player UI
    dom.nowPlayingText.textContent = text.slice(0, 48) + (text.length > 48 ? '...' : '');
    dom.nowPlayingModel.textContent = `${modelName} • ${voiceName}`;

    // Load into audio element and play immediately
    dom.audioElement.src = audioUrl;
    dom.audioElement.playbackRate = state.speeds[state.currentSpeedIndex];

    setupAudioContext();

    await dom.audioElement.play();
    state.isPlaying = true;
    updatePlayPauseButton();

    showToast('Narration ready & playing!', 'success');

    // Add to Recent Takes History
    addHistoryItem({
      id: Date.now(),
      text: text,
      voiceName: voiceName,
      modelName: modelName,
      audioUrl: audioUrl,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    // Refresh quota stats in background
    fetchUserData();

  } catch (err) {
    console.error('Narration failed:', err);
    showToast(`Synthesis failed: ${err.message}`, 'error');
  } finally {
    setLoadingState(false);
  }
}

function setLoadingState(loading) {
  dom.startNarrationBtn.disabled = loading;
  if (loading) {
    dom.btnSpinner.style.display = 'block';
    dom.btnPlaySvg.style.display = 'none';
    dom.actionBtnText.textContent = 'Generating Voice...';
    dom.actionBtnSub.textContent = 'Communicating with ElevenLabs neural models';
  } else {
    dom.btnSpinner.style.display = 'none';
    dom.btnPlaySvg.style.display = 'block';
    dom.actionBtnText.textContent = 'Play Narration';
    dom.actionBtnSub.textContent = 'Synthesizes audio with selected ElevenLabs model';
  }
}

// Audio Playback Controls
function toggleAudioPlayback() {
  if (!dom.audioElement.src) {
    // If no audio loaded yet, trigger narration
    startNarration();
    return;
  }

  if (dom.audioElement.paused) {
    setupAudioContext();
    dom.audioElement.play();
    state.isPlaying = true;
  } else {
    dom.audioElement.pause();
    state.isPlaying = false;
  }
  updatePlayPauseButton();
}

function updatePlayPauseButton() {
  if (state.isPlaying) {
    dom.playPauseIcon.innerHTML = `
      <rect x="6" y="4" width="4" height="16"></rect>
      <rect x="14" y="4" width="4" height="16"></rect>
    `;
  } else {
    dom.playPauseIcon.innerHTML = `
      <polygon points="5 3 19 12 5 21 5 3"></polygon>
    `;
  }
}

function updateAudioProgress() {
  const current = dom.audioElement.currentTime || 0;
  const duration = dom.audioElement.duration || 0;

  dom.currentTimeLabel.textContent = formatTime(current);

  if (duration > 0) {
    const percent = (current / duration) * 100;
    dom.seekSlider.value = percent;
    dom.seekBarProgress.style.width = percent + '%';
    dom.totalDurationLabel.textContent = formatTime(duration);
  }
}

function onAudioEnded() {
  state.isPlaying = false;
  updatePlayPauseButton();
  dom.seekSlider.value = 0;
  dom.seekBarProgress.style.width = '0%';
}

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Web Audio API & Visualizer Canvas
function setupCanvas() {
  const canvas = dom.visualizerCanvas;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  canvas.width = (rect.width || 800) * dpr;
  canvas.height = (rect.height || 96) * dpr;

  window.addEventListener('resize', () => {
    const r = canvas.getBoundingClientRect();
    canvas.width = r.width * dpr;
    canvas.height = r.height * dpr;
  });
}

function setupAudioContext() {
  if (!state.audioContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    state.audioContext = new AudioCtx();
    state.analyser = state.audioContext.createAnalyser();
    state.analyser.fftSize = 128;
    state.analyser.smoothingTimeConstant = 0.8;

    state.audioSource = state.audioContext.createMediaElementSource(dom.audioElement);
    state.audioSource.connect(state.analyser);
    state.analyser.connect(state.audioContext.destination);

    renderVisualizerLoop();
  }

  if (state.audioContext.state === 'suspended') {
    state.audioContext.resume();
  }
}

// Render Real-time Waveform on Canvas
function renderVisualizerLoop() {
  const canvas = dom.visualizerCanvas;
  const ctx = canvas.getContext('2d');
  const bufferLength = state.analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  function draw() {
    state.animationFrameId = requestAnimationFrame(draw);

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    if (state.isPlaying && !dom.audioElement.paused) {
      state.analyser.getByteFrequencyData(dataArray);

      const barCount = 42;
      const barWidth = (width / barCount) * 0.65;
      const gap = (width / barCount) * 0.35;

      for (let i = 0; i < barCount; i++) {
        // Map frequency bins
        const binIndex = Math.floor((i / barCount) * bufferLength);
        const value = dataArray[binIndex] || 0;
        const barHeight = Math.max(4, (value / 255) * height * 0.85);

        const x = i * (barWidth + gap) + gap / 2;
        const y = height / 2 - barHeight / 2;

        // Radiant Indigo-to-Cyan gradient
        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        grad.addColorStop(0, '#a855f7');
        grad.addColorStop(0.5, '#6366f1');
        grad.addColorStop(1, '#06b6d4');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 4);
        ctx.fill();
      }
    } else {
      // Idle gentle sine wave pulse
      renderCanvasIdleWave(ctx, width, height);
    }
  }

  draw();
}

let idlePhase = 0;
function renderCanvasIdleWave(providedCtx, providedWidth, providedHeight) {
  const canvas = dom.visualizerCanvas;
  const ctx = providedCtx || canvas.getContext('2d');
  const width = providedWidth || canvas.width;
  const height = providedHeight || canvas.height;

  idlePhase += 0.03;

  ctx.clearRect(0, 0, width, height);

  ctx.lineWidth = 2.5;
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.35)';
  ctx.beginPath();

  for (let x = 0; x < width; x += 4) {
    const y = height / 2 + Math.sin(x * 0.015 + idlePhase) * 12 * Math.sin(x / width * Math.PI);
    if (x === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.stroke();

  // Secondary subtle accent wave
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
  ctx.beginPath();
  for (let x = 0; x < width; x += 4) {
    const y = height / 2 + Math.cos(x * 0.018 - idlePhase * 0.8) * 8 * Math.sin(x / width * Math.PI);
    if (x === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.stroke();
}

// History Management
function addHistoryItem(item) {
  state.history.unshift(item);
  if (state.history.length > 20) state.history.pop();
  renderHistory();
}

function renderHistory() {
  const container = dom.historyList;
  container.innerHTML = '';

  dom.historyCountTag.textContent = `${state.history.length} items`;

  if (state.history.length === 0) {
    dom.historyEmpty.style.display = 'flex';
    container.appendChild(dom.historyEmpty);
    return;
  }

  dom.historyEmpty.style.display = 'none';

  state.history.forEach(item => {
    const el = document.createElement('div');
    el.className = 'history-item';
    el.innerHTML = `
      <div class="history-item-left">
        <button class="history-play-btn" title="Play Take">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </button>
        <div class="history-info">
          <div class="history-text">${escapeHtml(item.text)}</div>
          <div class="history-meta">
            <span>${item.voiceName}</span>
            <span>•</span>
            <span>${item.modelName}</span>
            <span>•</span>
            <span>${item.timestamp}</span>
          </div>
        </div>
      </div>
      <div class="history-item-actions">
        <button class="player-icon-btn download-history-btn" title="Download Audio">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
        </button>
      </div>
    `;

    // Play button in history item
    el.querySelector('.history-play-btn').addEventListener('click', () => {
      state.currentAudioUrl = item.audioUrl;
      dom.audioElement.src = item.audioUrl;
      dom.nowPlayingText.textContent = item.text.slice(0, 48) + (item.text.length > 48 ? '...' : '');
      dom.nowPlayingModel.textContent = `${item.modelName} • ${item.voiceName}`;

      setupAudioContext();
      dom.audioElement.play();
      state.isPlaying = true;
      updatePlayPauseButton();
      showToast(`Playing take: "${item.text.slice(0, 24)}..."`, 'success');
    });

    // Download button in history item
    el.querySelector('.download-history-btn').addEventListener('click', () => {
      const a = document.createElement('a');
      a.href = item.audioUrl;
      a.download = `elevenlabs_${item.voiceName.toLowerCase()}_${item.id}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });

    container.appendChild(el);
  });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Toast Notification
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  dom.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3500);
}

// Bootstrap
window.addEventListener('DOMContentLoaded', initApp);
