# 🎵 Jail Music Project

LIVE ---> https://dutatiberiu.github.io/jail-music-project/

Un music player web modern și elegant, optimizat pentru rulare offline pe GitHub Pages. Perfect pentru ascultarea muzicii locale fără dependințe externe.

## ✨ Features

- 🎨 **Design Dark Mode Elaborat** - UI modern cu glassmorphism și gradient-uri
- 🎵 **Audio Visualizer** - Vizualizare în timp real folosind Web Audio API
- 📀 **Album Selector** - Organizare pe albume cu dropdown + opțiunea "All Songs"
- ⏯️ **Control Complet** - Play, Pause, Next, Previous, Shuffle, Repeat
- 📊 **Progress Bar Interactiv** - Seek și display timestamp
- 🔊 **Volume Control** - Slider cu mute/unmute
- 📝 **Playlist Dinamic** - Afișare, selecție și highlight melodie curentă
- 🔍 **Search/Filter** - Căutare în timp real în playlist
- ⌨️ **Keyboard Shortcuts** - Spațiu (play/pause), săgeți (next/prev)
- 📱 **Responsive Design** - Funcționează pe desktop, tablet și mobile
- 🎼 **Multi-Format** - Suport pentru MP3 și FLAC
- 🔒 **100% Offline** - Fără dependințe externe, fără tracking

```

## 🎮 Cum să Folosești

### Album Selector
- **Dropdown** în partea de sus a playlist-ului
- Selectează **"🎵 All Songs"** pentru toată muzica
- Selectează un album specific pentru acel album

### Controale Mouse
- **Play/Pause** - Click butonul mare central
- **Next/Previous** - Click butoanele săgeți
- **Shuffle** - Click butonul shuffle pentru randomizare
- **Repeat** - Click de mai multe ori pentru: Off → Repeat All → Repeat One
- **Progress Bar** - Click oriunde pentru seek
- **Volume** - Slide slider-ul sau click pe iconița pentru mute
- **Playlist** - Click pe orice melodie pentru a o reda
- **Search** - Tastează în search bar pentru a filtra (funcționează în albumul curent)

### Keyboard Shortcuts
- **Spațiu** - Play/Pause
- **→** (Săgeată Dreapta) - Next song
- **←** (Săgeată Stânga) - Previous song

### Repeat Modes
- **Off** - Oprește după ultima melodie din album
- **All** (Purple glow) - Repetă albumul curent
- **One** (Cyan glow) - Repetă melodia curentă

## 🛠️ Tehnologii Folosite

- **HTML5** - Structură semantică
- **CSS3** - Dark mode, glassmorphism, animations
- **Vanilla JavaScript** - Fără dependențe externe
- **Web Audio API** - Pentru audio visualizer
- **Canvas API** - Pentru desenarea visualizer-ului

## 🔒 Privacy & Security

- ✅ **100% Local** - Tot codul rulează în browser
- ✅ **Fără CDN-uri** - Fără Google Fonts, jQuery, etc.
- ✅ **Fără Tracking** - Zero analytics sau scripturi externe
- ✅ **Fără API Calls** - Doar `playlist.json` local
- ✅ **Offline Capable** - Funcționează după load inițial

Perfect pentru utilizare în medii restrictive (corporate networks, Zscaler, etc.)

## 📁 Structura Proiectului

```
jail-music-project/
├── index.html          # HTML principal cu UI
├── styles.css          # Styling dark mode
├── app.js             # Logica player-ului (cu suport albume)
├── playlist.json      # Lista albumelor și melodiilor
├── mp3/               # Folder cu muzică organizată pe albume
│   ├── Album 1/
│   │   └── *.mp3
│   ├── Album 2/
│   │   └── *.flac
│   └── Singles/
│       └── *.mp3
└── README.md          # Acest fișier
```

## 📜 License

Proiect personal - Free to use and modify

## 🤝 Contributing

Feel free to fork, modify și improve!

---

**Made with 🎵 for private music listening**

*No tracking • No analytics • No external calls • 100% yours*
