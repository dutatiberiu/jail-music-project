// ===== GLOBAL STATE =====
const state = {
    baseUrl: '',
    artists: [],           // NEW: Store artist data with their albums
    albums: [],
    allSongs: [],
    currentArtist: null,   // NEW: Track selected artist ID
    currentAlbum: null,
    currentSongs: [],
    currentIndex: 0,
    currentTab: 'artists', // NEW: Track current tab
    isPlaying: false,
    isShuffle: false,
    repeatMode: 'off', // 'off', 'all', 'one'
    volume: 0.7,
    isMuted: false,
    previousVolume: 0.7,
    filteredSongs: [],
    shuffleHistory: [],
    // Visualizer state
    visualizerStyle: localStorage.getItem('visualizerStyle') || 'enhanced-bars',
    smoothingFactor: 0.75,
    previousDataArray: null,
    visualizerOpacity: 1
};

// ===== DOM ELEMENTS =====
const audio = document.getElementById('audio');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const repeatBtn = document.getElementById('repeatBtn');
const volumeBtn = document.getElementById('volumeBtn');
const volumeRange = document.getElementById('volumeRange');
const volumeFill = document.getElementById('volumeFill');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const progressHandle = document.getElementById('progressHandle');
const timeCurrent = document.getElementById('timeCurrent');
const timeDuration = document.getElementById('timeDuration');
const songTitle = document.getElementById('songTitle');
const songArtist = document.getElementById('songArtist');
const playlistItems = document.getElementById('playlistItems');
const searchInput = document.getElementById('searchInput');
const visualizerCanvas = document.getElementById('visualizer');

// NEW: Tab elements
const artistsPanel = document.getElementById('artists-panel');
const albumsPanel = document.getElementById('albums-panel');
const songsPanel = document.getElementById('songs-panel');

// ===== WEB AUDIO API SETUP =====
let audioContext;
let analyser;
let dataArray;
let bufferLength;
let animationId;

function setupAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioContext.destination);

        // Increased FFT size for better frequency resolution
        analyser.fftSize = 512; // Changed from 256
        // Smoothing for more fluid visualization
        analyser.smoothingTimeConstant = 0.7;

        bufferLength = analyser.frequencyBinCount; // Now 256
        dataArray = new Uint8Array(bufferLength);
    }
}

// ===== VISUALIZER RENDERERS =====
const VisualizerRenderers = {
    // Shared gradient cache to avoid recreating per frame
    gradientCache: {},

    // Base renderer with common utilities
    BaseRenderer: {
        // Reusable gradient - create once, reuse forever
        getGradient(ctx, type, x1, y1, x2, y2) {
            const key = `${type}-${x1}-${y1}-${x2}-${y2}`;
            if (!VisualizerRenderers.gradientCache[key]) {
                const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
                gradient.addColorStop(0, '#6c5ce7');
                gradient.addColorStop(0.5, '#00d4ff');
                gradient.addColorStop(1, '#6c5ce7');
                VisualizerRenderers.gradientCache[key] = gradient;
            }
            return VisualizerRenderers.gradientCache[key];
        },

        // Smooth interpolation between data points
        interpolateData(current, previous, factor) {
            if (!previous) return current;
            return new Uint8Array(current.map((val, i) =>
                previous[i] + (val - previous[i]) * factor
            ));
        },

        // Apply glow effect
        applyGlow(ctx, color, blur) {
            ctx.shadowColor = color;
            ctx.shadowBlur = blur;
        },

        clearGlow(ctx) {
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
        }
    },

    // Enhanced Bars Renderer - Simple vertical bars
    'enhanced-bars': {
        render(ctx, width, height, dataArray, smoothedData) {
            const barCount = bufferLength;
            const barWidth = (width / barCount) * 2.5;
            const gap = 1;
            let x = 0;

            // Simple gradient from bottom to top
            const gradient = ctx.createLinearGradient(0, height, 0, 0);
            gradient.addColorStop(0, '#6c5ce7');
            gradient.addColorStop(0.5, '#00d4ff');
            gradient.addColorStop(1, '#6c5ce7');

            for (let i = 0; i < smoothedData.length; i++) {
                const barHeight = (smoothedData[i] / 255) * height * 0.8;

                ctx.fillStyle = gradient;
                ctx.fillRect(x, height - barHeight, barWidth - gap, barHeight);

                x += barWidth;
            }
        }
    },

    // Circular/Radial Renderer - No glow
    'circular': {
        render(ctx, width, height, dataArray, smoothedData) {
            const centerX = width / 2;
            const centerY = height / 2;
            const maxDimension = Math.min(width, height);
            const radius = maxDimension * 0.3;
            const maxBarHeight = maxDimension * 0.25;

            // Draw radial bars
            this.drawRadialBars(ctx, centerX, centerY, radius, maxBarHeight, smoothedData);

            // Draw center circle
            this.drawCenterCircle(ctx, centerX, centerY, radius * 0.3);
        },

        drawRadialBars(ctx, centerX, centerY, innerRadius, maxBarHeight, data) {
            const barCount = data.length;
            const angleStep = (Math.PI * 2) / barCount;

            for (let i = 0; i < barCount; i++) {
                const angle = i * angleStep - Math.PI / 2;
                const barHeight = (data[i] / 255) * maxBarHeight;

                const innerX = centerX + Math.cos(angle) * innerRadius;
                const innerY = centerY + Math.sin(angle) * innerRadius;
                const outerX = centerX + Math.cos(angle) * (innerRadius + barHeight);
                const outerY = centerY + Math.sin(angle) * (innerRadius + barHeight);

                // Create gradient for this bar
                const gradient = ctx.createLinearGradient(innerX, innerY, outerX, outerY);
                gradient.addColorStop(0, '#6c5ce7');
                gradient.addColorStop(1, '#00d4ff');

                ctx.strokeStyle = gradient;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(innerX, innerY);
                ctx.lineTo(outerX, outerY);
                ctx.stroke();
            }
        },

        drawCenterCircle(ctx, centerX, centerY, radius) {
            const gradient = ctx.createRadialGradient(
                centerX, centerY, 0,
                centerX, centerY, radius
            );
            gradient.addColorStop(0, '#00d4ff');
            gradient.addColorStop(1, '#6c5ce7');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fill();
        }
    },

    // Waveform Renderer
    'waveform': {
        render(ctx, width, height, dataArray, smoothedData) {
            // Use time domain data for waveform
            analyser.getByteTimeDomainData(dataArray);

            const centerY = height / 2;

            // Draw main waveform with glow
            this.drawWave(ctx, width, height, dataArray, centerY, 1.0, '#00d4ff', 3);

            // Draw secondary waveform (mirrored)
            this.drawWave(ctx, width, height, dataArray, centerY, 0.6, '#6c5ce7', 2);
        },

        drawWave(ctx, width, height, data, centerY, amplitude, color, lineWidth) {
            const sliceWidth = width / data.length;

            ctx.save();

            // Apply subtle glow
            VisualizerRenderers.BaseRenderer.applyGlow(ctx, color, 5);

            ctx.lineWidth = lineWidth;
            ctx.strokeStyle = color;
            ctx.beginPath();

            let x = 0;
            for (let i = 0; i < data.length; i++) {
                const v = data[i] / 128.0;
                const y = centerY + ((v - 1) * (height / 2) * amplitude);

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    // Use quadratic curves for smoothness
                    const prevX = x - sliceWidth;
                    const prevV = data[i - 1] / 128.0;
                    const prevY = centerY + ((prevV - 1) * (height / 2) * amplitude);
                    const cpX = (prevX + x) / 2;
                    const cpY = (prevY + y) / 2;
                    ctx.quadraticCurveTo(prevX, prevY, cpX, cpY);
                }

                x += sliceWidth;
            }

            ctx.stroke();

            VisualizerRenderers.BaseRenderer.clearGlow(ctx);
            ctx.restore();
        }
    }
};

// ===== MAIN VISUALIZER FUNCTION =====
function drawVisualizer() {
    if (!state.isPlaying) {
        const ctx = visualizerCanvas.getContext('2d');
        ctx.clearRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);
        return;
    }

    animationId = requestAnimationFrame(drawVisualizer);

    // Get frequency data
    analyser.getByteFrequencyData(dataArray);

    // Apply smoothing for fluid animation
    const smoothedData = VisualizerRenderers.BaseRenderer.interpolateData(
        dataArray,
        state.previousDataArray,
        state.smoothingFactor
    );
    state.previousDataArray = new Uint8Array(smoothedData);

    const ctx = visualizerCanvas.getContext('2d');
    const width = visualizerCanvas.width;
    const height = visualizerCanvas.height;

    // Clear canvas with fade effect
    ctx.fillStyle = `rgba(10, 14, 39, ${1 - state.visualizerOpacity})`;
    ctx.fillRect(0, 0, width, height);

    // Apply global opacity for transitions
    ctx.save();
    ctx.globalAlpha = state.visualizerOpacity;

    // Render using selected style
    const renderer = VisualizerRenderers[state.visualizerStyle];
    if (renderer && renderer.render) {
        renderer.render(ctx, width, height, dataArray, smoothedData);
    }

    ctx.restore();
}

// ===== VISUALIZER STYLE SWITCHING =====
function switchVisualizerStyle(newStyle) {
    if (state.visualizerStyle === newStyle) return;

    // Fade out current style
    fadeVisualizerTransition(() => {
        state.visualizerStyle = newStyle;
        localStorage.setItem('visualizerStyle', newStyle);

        // Clear gradient cache when switching to avoid artifacts
        VisualizerRenderers.gradientCache = {};

        // Update UI
        updateVisualizerButtons();
    });
}

function fadeVisualizerTransition(callback) {
    const fadeOutDuration = 300; // ms
    const startTime = performance.now();
    const initialOpacity = state.visualizerOpacity;

    function fadeOut(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / fadeOutDuration, 1);

        state.visualizerOpacity = initialOpacity * (1 - progress);

        if (progress < 1) {
            requestAnimationFrame(fadeOut);
        } else {
            // Switch style at lowest opacity
            callback();
            // Fade back in
            fadeIn();
        }
    }

    function fadeIn() {
        const fadeInDuration = 300;
        const startTime = performance.now();

        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / fadeInDuration, 1);

            state.visualizerOpacity = progress;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }

        requestAnimationFrame(animate);
    }

    requestAnimationFrame(fadeOut);
}

function updateVisualizerButtons() {
    document.querySelectorAll('.visualizer-style-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.style === state.visualizerStyle);
    });
}

// Debounced resize for better performance
let resizeTimeout;
function resizeCanvas() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const container = visualizerCanvas.parentElement;
        const dpr = window.devicePixelRatio || 1;

        // Set display size
        visualizerCanvas.style.width = container.offsetWidth + 'px';
        visualizerCanvas.style.height = container.offsetHeight + 'px';

        // Set actual size in memory (scaled for retina displays)
        visualizerCanvas.width = container.offsetWidth * dpr;
        visualizerCanvas.height = container.offsetHeight * dpr;

        // Scale context to match device pixel ratio
        const ctx = visualizerCanvas.getContext('2d');
        ctx.scale(dpr, dpr);

        // Clear gradient cache on resize
        VisualizerRenderers.gradientCache = {};
    }, 150);
}

// ===== PLAYLIST FUNCTIONS =====
async function loadPlaylist() {
    try {
        const response = await fetch('playlist.json');
        const data = await response.json();

        // Store baseUrl for R2 access
        state.baseUrl = data.baseUrl;
        state.artists = [];
        state.albums = [];
        state.allSongs = [];

        // Build artists array with nested album data
        data.users.forEach(user => {
            user.artists.forEach(artist => {
                const artistData = {
                    id: artist.id,
                    name: artist.name,
                    albums: artist.albums.map(album => ({
                        id: album.id,
                        name: album.name,
                        path: album.path,
                        songs: album.songs,
                        artistName: artist.name,
                        artistId: artist.id
                    }))
                };
                state.artists.push(artistData);

                // Also build flat albums array (for backwards compatibility)
                artistData.albums.forEach(album => {
                    state.albums.push({
                        id: album.id,
                        name: `${artist.name} - ${album.name}`,
                        path: album.path,
                        songs: album.songs,
                        artistName: artist.name,
                        artistId: artist.id
                    });

                    // Build all songs array
                    album.songs.forEach((filename) => {
                        state.allSongs.push({
                            filename: filename,
                            path: album.path,
                            albumId: album.id,
                            albumName: album.name,
                            artistName: artist.name,
                            artistId: artist.id,
                            globalIndex: state.allSongs.length
                        });
                    });
                });
            });
        });

        // Initialize tabs
        renderArtists();
        renderAlbums();
        loadAllSongs(); // Start with all songs in songs tab
    } catch (error) {
        console.error('Error loading playlist:', error);
        songTitle.textContent = 'Error loading playlist';
        songArtist.textContent = 'Check playlist.json file';
    }
}

// Render Artists Tab
function renderArtists() {
    const html = state.artists.map(artist => {
        const totalSongs = artist.albums.reduce((sum, album) => sum + album.songs.length, 0);
        return `
            <div class="list-item ${state.currentArtist === artist.id ? 'active' : ''}" onclick="selectArtist('${artist.id}')">
                <div class="list-item-header">
                    <div class="list-item-name">${artist.name}</div>
                    <div class="list-item-count">${artist.albums.length} albums • ${totalSongs} songs</div>
                </div>
            </div>
        `;
    }).join('');
    artistsPanel.innerHTML = html;
}

// Render Albums Tab (filtered by artist if selected)
function renderAlbums() {
    let albumsToShow = [];

    if (!state.currentArtist) {
        // Show all albums from all artists
        albumsToShow = state.albums.map(album => ({
            ...album,
            displayName: album.name // Already includes artist name
        }));
    } else {
        // Show only albums from selected artist
        const artist = state.artists.find(a => a.id === state.currentArtist);
        if (artist) {
            albumsToShow = artist.albums.map(album => ({
                ...album,
                displayName: album.name // Just album name
            }));
        }
    }

    const html = albumsToShow.map(album => `
        <div class="list-item ${state.currentAlbum === album.id ? 'active' : ''}" onclick="selectAlbum('${album.id}')">
            <div class="list-item-header">
                <div class="list-item-name">${album.displayName}</div>
                <div class="list-item-count">${album.songs.length} songs</div>
            </div>
        </div>
    `).join('');

    albumsPanel.innerHTML = html || '<div style="padding: 20px; text-align: center; color: #a0a0a0;">No albums</div>';
}

// Select Artist
function selectArtist(artistId) {
    state.currentArtist = artistId;
    state.currentAlbum = null;
    renderArtists();
    renderAlbums();
    // Auto-switch to albums tab
    switchTab('albums');
}

// Select Album
function selectAlbum(albumId) {
    state.currentAlbum = albumId;

    const album = state.albums.find(a => a.id === albumId);
    if (!album) return;

    state.currentSongs = album.songs.map((filename, index) => ({
        filename: filename,
        path: album.path,
        albumId: album.id,
        albumName: album.name,
        artistName: album.artistName,
        index: index
    }));

    state.filteredSongs = [...state.currentSongs];
    state.currentIndex = 0;
    renderPlaylist();
    renderAlbums();

    // Auto-switch to songs tab
    switchTab('songs');

    if (state.currentSongs.length > 0) {
        loadSong(0);
    }
}

// Load all songs
function loadAllSongs() {
    state.currentSongs = state.allSongs.map((song, index) => ({
        ...song,
        index: index
    }));
    state.filteredSongs = [...state.currentSongs];
    state.currentIndex = 0;
    renderPlaylist();
    if (state.currentSongs.length > 0) {
        loadSong(0);
    }
}

// Switch Tab
function switchTab(tabName) {
    state.currentTab = tabName;

    // Update tab buttons
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.tab === tabName) {
            tab.classList.add('active');
        }
    });

    // Update tab panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    document.getElementById(tabName + '-panel').classList.add('active');
}

function renderPlaylist() {
    playlistItems.innerHTML = '';
    state.filteredSongs.forEach((song, displayIndex) => {
        const item = document.createElement('div');
        item.className = 'playlist-item';
        if (song.index === state.currentIndex) {
            item.classList.add('active');
        }

        const { title, artist } = parseSongName(song.filename);

        item.innerHTML = `
            <div class="playlist-item-number">${displayIndex + 1}</div>
            <div class="playlist-item-info">
                <div class="playlist-item-title">${title}</div>
                <div class="playlist-item-artist">${artist}</div>
            </div>
        `;

        item.addEventListener('click', () => {
            loadSong(song.index);
            play();
        });

        playlistItems.appendChild(item);
    });

    // Scroll to active item
    setTimeout(() => {
        const activeItem = playlistItems.querySelector('.playlist-item.active');
        if (activeItem) {
            activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, 100);
}

function parseSongName(filename) {
    // Remove file extension
    const nameWithoutExt = filename.replace(/\.(mp3|MP3|flac|FLAC)$/, '');

    // Check for "Artist - Title" pattern
    if (nameWithoutExt.includes(' - ')) {
        const parts = nameWithoutExt.split(' - ');
        // If it starts with a number (track number), skip it
        if (/^\d+\.?\s*/.test(parts[0])) {
            // Format: "01. Title" or "01 - Title"
            const titlePart = parts.slice(1).join(' - ');
            return {
                artist: parts[0].replace(/^\d+\.?\s*/, '').trim() || 'Unknown Artist',
                title: titlePart || nameWithoutExt
            };
        }
        return {
            artist: parts[0].trim(),
            title: parts.slice(1).join(' - ').trim()
        };
    }

    // Check for track number at start
    if (/^\d+\.?\s+/.test(nameWithoutExt)) {
        const title = nameWithoutExt.replace(/^\d+\.?\s+/, '');
        return {
            artist: 'Unknown Artist',
            title: title
        };
    }

    return {
        artist: 'Unknown Artist',
        title: nameWithoutExt
    };
}

// ===== SONG LOADING =====
function loadSong(index) {
    if (index < 0 || index >= state.currentSongs.length) return;

    state.currentIndex = index;
    const song = state.currentSongs[index];
    const { title, artist } = parseSongName(song.filename);

    // Build R2 URL: baseUrl/path/filename (properly encoded)
    const pathParts = song.path.split('/').map(encodeURIComponent);
    const encodedFilename = encodeURIComponent(song.filename);
    // Add cache-busting parameter to force fresh CORS headers
    audio.src = `${state.baseUrl}/${pathParts.join('/')}/${encodedFilename}?v=2`;

    songTitle.textContent = title;
    songArtist.textContent = song.artistName || artist;

    // Reset visualizer animation when changing song
    state.previousDataArray = null;

    renderPlaylist();
}

// ===== PLAYBACK CONTROLS =====
function play() {
    if (!audioContext) {
        setupAudioContext();
    }

    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    const playPromise = audio.play();

    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                console.log('Audio playback started successfully');
                state.isPlaying = true;
                updatePlayButton();
                drawVisualizer();
            })
            .catch(error => {
                console.error('Error playing audio:', error);
                console.log('Audio src:', audio.src);
                console.log('Audio ready state:', audio.readyState);
                console.log('Audio network state:', audio.networkState);
            });
    }
}

function pause() {
    audio.pause();
    state.isPlaying = false;
    updatePlayButton();
}

function togglePlay() {
    if (state.isPlaying) {
        pause();
    } else {
        play();
    }
}

function updatePlayButton() {
    const playIcon = playBtn.querySelector('.play-icon');
    const pauseIcon = playBtn.querySelector('.pause-icon');

    if (state.isPlaying) {
        playIcon.classList.add('hidden');
        pauseIcon.classList.remove('hidden');
        document.body.classList.add('playing');
    } else {
        playIcon.classList.remove('hidden');
        pauseIcon.classList.add('hidden');
        document.body.classList.remove('playing');
    }
}

function nextSong() {
    if (state.isShuffle) {
        state.shuffleHistory.push(state.currentIndex);
        const remainingSongs = state.currentSongs
            .map((_, i) => i)
            .filter(i => i !== state.currentIndex);

        if (remainingSongs.length === 0) {
            state.currentIndex = 0;
        } else {
            const randomIndex = Math.floor(Math.random() * remainingSongs.length);
            state.currentIndex = remainingSongs[randomIndex];
        }
    } else {
        state.currentIndex = (state.currentIndex + 1) % state.currentSongs.length;
    }

    loadSong(state.currentIndex);
    if (state.isPlaying) {
        play();
    }
}

function prevSong() {
    if (state.isShuffle && state.shuffleHistory.length > 0) {
        state.currentIndex = state.shuffleHistory.pop();
    } else {
        state.currentIndex = (state.currentIndex - 1 + state.currentSongs.length) % state.currentSongs.length;
    }

    loadSong(state.currentIndex);
    if (state.isPlaying) {
        play();
    }
}

// ===== SHUFFLE & REPEAT =====
function toggleShuffle() {
    state.isShuffle = !state.isShuffle;
    shuffleBtn.classList.toggle('active', state.isShuffle);
    if (state.isShuffle) {
        state.shuffleHistory = [];
    }
}

function toggleRepeat() {
    const modes = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(state.repeatMode);
    state.repeatMode = modes[(currentIndex + 1) % modes.length];

    repeatBtn.classList.toggle('active', state.repeatMode !== 'off');

    // Visual feedback for repeat mode
    if (state.repeatMode === 'one') {
        repeatBtn.style.boxShadow = '0 0 20px rgba(0, 212, 255, 0.6)';
    } else if (state.repeatMode === 'all') {
        repeatBtn.style.boxShadow = '0 0 20px rgba(108, 92, 231, 0.6)';
    } else {
        repeatBtn.style.boxShadow = '';
    }
}

// ===== VOLUME CONTROLS =====
function setVolume(value) {
    state.volume = value / 100;
    audio.volume = state.volume;
    volumeFill.style.width = value + '%';

    updateVolumeIcon();
}

function toggleMute() {
    if (state.isMuted) {
        state.isMuted = false;
        audio.volume = state.previousVolume;
        volumeRange.value = state.previousVolume * 100;
        volumeFill.style.width = (state.previousVolume * 100) + '%';
    } else {
        state.isMuted = true;
        state.previousVolume = audio.volume;
        audio.volume = 0;
        volumeRange.value = 0;
        volumeFill.style.width = '0%';
    }

    updateVolumeIcon();
}

function updateVolumeIcon() {
    const volumeIcon = volumeBtn.querySelector('.volume-icon');
    const muteIcon = volumeBtn.querySelector('.mute-icon');

    if (audio.volume === 0 || state.isMuted) {
        volumeIcon.classList.add('hidden');
        muteIcon.classList.remove('hidden');
    } else {
        volumeIcon.classList.remove('hidden');
        muteIcon.classList.add('hidden');
    }
}

// ===== PROGRESS BAR =====
function updateProgress() {
    if (audio.duration) {
        const percent = (audio.currentTime / audio.duration) * 100;
        progressFill.style.width = percent + '%';
        progressHandle.style.left = percent + '%';

        timeCurrent.textContent = formatTime(audio.currentTime);
        timeDuration.textContent = formatTime(audio.duration);
    }
}

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function seek(e) {
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const time = percent * audio.duration;

    if (!isNaN(time)) {
        audio.currentTime = time;
    }
}

// ===== SEARCH/FILTER =====
function filterPlaylist(query) {
    const lowerQuery = query.toLowerCase();
    state.filteredSongs = state.currentSongs.filter(song =>
        song.filename.toLowerCase().includes(lowerQuery)
    );
    renderPlaylist();
}

// ===== EVENT LISTENERS =====
playBtn.addEventListener('click', togglePlay);
prevBtn.addEventListener('click', prevSong);
nextBtn.addEventListener('click', nextSong);
shuffleBtn.addEventListener('click', toggleShuffle);
repeatBtn.addEventListener('click', toggleRepeat);
volumeBtn.addEventListener('click', toggleMute);
volumeRange.addEventListener('input', (e) => setVolume(e.target.value));
progressBar.addEventListener('click', seek);
searchInput.addEventListener('input', (e) => filterPlaylist(e.target.value));

// Tab switching
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        switchTab(tab.dataset.tab);
    });
});

// Audio events
audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('loadedmetadata', updateProgress);
audio.addEventListener('ended', () => {
    if (state.repeatMode === 'one') {
        audio.currentTime = 0;
        play();
    } else if (state.repeatMode === 'all' || state.currentIndex < state.currentSongs.length - 1) {
        nextSong();
    } else {
        pause();
    }
});

// Debug audio loading
audio.addEventListener('loadstart', () => console.log('Audio loading started'));
audio.addEventListener('canplay', () => console.log('Audio can play'));
audio.addEventListener('playing', () => console.log('Audio is playing'));
audio.addEventListener('error', (e) => {
    console.error('Audio error:', e);
    console.error('Audio error details:', audio.error);
    console.log('Failed URL:', audio.src);
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'SELECT') {
        e.preventDefault();
        togglePlay();
    } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        nextSong();
    } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        prevSong();
    }
});

// Window resize for canvas
window.addEventListener('resize', resizeCanvas);

// Visualizer style button event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Add click handlers to visualizer style buttons
    document.querySelectorAll('.visualizer-style-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchVisualizerStyle(btn.dataset.style);
        });
    });

    // Initialize button states based on saved preference
    updateVisualizerButtons();
});

// ===== INITIALIZATION =====
function init() {
    resizeCanvas();
    setVolume(70);
    loadPlaylist();
}

// Start the app
init();
