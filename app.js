// ===== GLOBAL STATE =====
const state = {
    baseUrl: '',
    albums: [],
    allSongs: [],
    currentAlbum: null,
    currentSongs: [],
    currentIndex: 0,
    isPlaying: false,
    isShuffle: false,
    repeatMode: 'off', // 'off', 'all', 'one'
    volume: 0.7,
    isMuted: false,
    previousVolume: 0.7,
    filteredSongs: [],
    shuffleHistory: []
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
const albumSelect = document.getElementById('albumSelect');
const visualizerCanvas = document.getElementById('visualizer');

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
        analyser.fftSize = 256;
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
    }
}

// ===== VISUALIZER =====
function drawVisualizer() {
    if (!state.isPlaying) {
        const ctx = visualizerCanvas.getContext('2d');
        ctx.clearRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);
        return;
    }

    animationId = requestAnimationFrame(drawVisualizer);

    analyser.getByteFrequencyData(dataArray);

    const ctx = visualizerCanvas.getContext('2d');
    const width = visualizerCanvas.width;
    const height = visualizerCanvas.height;

    ctx.clearRect(0, 0, width, height);

    const barWidth = (width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * height * 0.8;

        const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
        gradient.addColorStop(0, '#6c5ce7');
        gradient.addColorStop(0.5, '#00d4ff');
        gradient.addColorStop(1, '#6c5ce7');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
    }
}

function resizeCanvas() {
    const container = visualizerCanvas.parentElement;
    visualizerCanvas.width = container.offsetWidth;
    visualizerCanvas.height = container.offsetHeight;
}

// ===== PLAYLIST FUNCTIONS =====
async function loadPlaylist() {
    try {
        const response = await fetch('playlist.json');
        const data = await response.json();

        // Store baseUrl for R2 access
        state.baseUrl = data.baseUrl;
        state.albums = [];
        state.allSongs = [];

        // Build albums and songs from multi-user structure
        data.users.forEach(user => {
            user.artists.forEach(artist => {
                artist.albums.forEach(album => {
                    // Add album to flat albums array
                    state.albums.push({
                        id: album.id,
                        name: `${artist.name} - ${album.name}`,
                        path: album.path,
                        songs: album.songs,
                        artistName: artist.name
                    });

                    // Add songs to all songs array
                    album.songs.forEach((filename) => {
                        state.allSongs.push({
                            filename: filename,
                            path: album.path,
                            albumId: album.id,
                            albumName: album.name,
                            artistName: artist.name,
                            globalIndex: state.allSongs.length
                        });
                    });
                });
            });
        });

        // Add "All Songs" option at the beginning
        state.albums.unshift({
            id: 'all',
            name: '🎵 All Songs',
            path: '',
            songs: [],
            artistName: ''
        });

        populateAlbumSelector();
        changeAlbum('all'); // Start with "All Songs"
    } catch (error) {
        console.error('Error loading playlist:', error);
        songTitle.textContent = 'Error loading playlist';
        songArtist.textContent = 'Check playlist.json file';
    }
}

function populateAlbumSelector() {
    albumSelect.innerHTML = '';
    state.albums.forEach(album => {
        const option = document.createElement('option');
        option.value = album.id;
        option.textContent = album.name;
        albumSelect.appendChild(option);
    });
}

function changeAlbum(albumId) {
    state.currentAlbum = albumId;
    albumSelect.value = albumId;
    searchInput.value = ''; // Clear search

    if (albumId === 'all') {
        // All songs
        state.currentSongs = state.allSongs.map((song, index) => ({
            ...song,
            index: index
        }));
    } else {
        // Specific album
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
    }

    state.filteredSongs = [...state.currentSongs];
    state.currentIndex = 0;
    renderPlaylist();

    if (state.currentSongs.length > 0) {
        loadSong(0);
    }
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
albumSelect.addEventListener('change', (e) => changeAlbum(e.target.value));

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

// ===== INITIALIZATION =====
function init() {
    resizeCanvas();
    setVolume(70);
    loadPlaylist();
}

// Start the app
init();
