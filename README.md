# 🎵 Jail Music Project

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

## 🚀 Setup Rapid

### 1. Clone Repository

```bash
git clone https://github.com/username/jail-music-project.git
cd jail-music-project
```

### 2. Organizează Muzica pe Albume

Creează foldere în `mp3/` pentru fiecare album:

```
jail-music-project/
├── mp3/
│   ├── Singles/
│   │   └── song.mp3
│   ├── Artist - Album Name/
│   │   ├── 01 - Track One.mp3
│   │   ├── 02 - Track Two.mp3
│   │   └── ...
│   └── Another Album/
│       └── ...
```

**Exemple din proiect:**
- `mp3/Maria Raducanu/` - conține toate melodiile de Maria Rădulcanu
- `mp3/Ed Sheeran - ÷/` - albumul Divide
- `mp3/Chopin - Nocturnes - Rubinstein/` - fișiere FLAC

### 3. Actualizează playlist.json

Editează fișierul `playlist.json` cu structura ta de albume:

```json
{
  "albums": [
    {
      "name": "🎵 All Songs",
      "id": "all"
    },
    {
      "name": "Maria Raducanu",
      "id": "maria-raducanu",
      "folder": "Maria Raducanu",
      "songs": [
        "Maria Raducanu - Cristina.mp3",
        "Maria Raducanu - Meu Amore.mp3"
      ]
    },
    {
      "name": "Ed Sheeran - ÷",
      "id": "ed-divide",
      "folder": "Ed Sheeran - ÷",
      "songs": [
        "01 - Eraser.mp3",
        "02 - Castle on the Hill.mp3",
        "03 - Dive.mp3"
      ]
    }
  ]
}
```

**Important:**
- `id` - identificator unic pentru album (folosit intern)
- `folder` - numele folderului din `mp3/` (exact cum apare)
- `songs` - array cu numele fișierelor (NU include path-ul)
- Primul album cu `id: "all"` afișează toate melodiile

### 4. Testează Local

Deschide `index.html` într-un browser modern sau folosește un server local:

```bash
# Cu Python 3
python -m http.server 8000

# Cu Node.js (npx)
npx serve

# Apoi accesează http://localhost:8000
```

## 📤 Deploy pe GitHub Pages

### Pasul 1: Creează Repository pe GitHub

1. Accesează [github.com](https://github.com)
2. Click pe "New repository"
3. Nume: `jail-music-project` (sau orice alt nume)
4. Setează ca **Public** sau **Private** (ambele funcționează cu Pages)
5. Click "Create repository"

### Pasul 2: Push Code

```bash
git init
git add .
git commit -m "Initial commit - Jail Music Player"
git branch -M main
git remote add origin https://github.com/username/jail-music-project.git
git push -u origin main
```

### Pasul 3: Activează GitHub Pages

1. Du-te la Settings → Pages
2. Source: selectează `main` branch
3. Folder: selectează `/ (root)`
4. Click "Save"

După câteva minute, site-ul va fi live la:
```
https://username.github.io/jail-music-project/
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

## 🎨 Customizare

### Schimbă Culorile

Editează `styles.css` și modifică variabilele de culoare:

```css
/* Color scheme principal */
Background: #0a0e27        /* Dark blue-black */
Secondary: #1a1f3a         /* Lighter blue */
Accent Purple: #6c5ce7     /* Purple accent */
Accent Cyan: #00d4ff       /* Cyan accent */
Text: #e0e0e0              /* Light gray */
```

### Modifică Visualizer-ul

În `app.js`, funcția `drawVisualizer()` poate fi modificată pentru:
- Waveform în loc de bars
- Alte culori
- Efecte diferite

## 🐛 Troubleshooting

### Muzica nu se încarcă
- Verifică că folderele MP3 există în `mp3/`
- Verifică că `folder` din playlist.json match-uiește exact numele folderului
- Verifică că numele fișierelor din `songs` array sunt exacte
- Deschide Console-ul browser-ului (F12) pentru erori

### Visualizer-ul nu funcționează
- Unele browsere blochează Web Audio API până la interacțiune user
- Click pe play și ar trebui să pornească
- Verifică că browser-ul suportă Web Audio API (Chrome, Firefox, Edge moderni)

### FLAC nu se redă
- Browser-ele moderne (Chrome, Firefox, Edge) suportă FLAC
- Safari pe iOS ar putea avea probleme cu FLAC
- Convertește la MP3 dacă e necesar

### Site-ul nu apare pe GitHub Pages
- Așteaptă 2-5 minute după activarea Pages
- Verifică că branch-ul și folderul sunt setate corect în Settings
- Clear cache-ul browser-ului

## 📝 Adăugare Melodii/Albume Noi

1. Adaugă folder nou în `mp3/` cu melodiile
2. Editează `playlist.json` și adaugă noul album:

```json
{
  "name": "New Album",
  "id": "new-album",
  "folder": "Artist - New Album",
  "songs": [
    "01 - Song One.mp3",
    "02 - Song Two.mp3"
  ]
}
```

3. Commit și push pe GitHub:

```bash
git add mp3/ playlist.json
git commit -m "Add new album"
git push
```

4. GitHub Pages se va actualiza automat în ~1 minut

## 📜 License

Proiect personal - Free to use and modify

## 🤝 Contributing

Feel free to fork, modify și improve!

---

**Made with 🎵 for private music listening**

*No tracking • No analytics • No external calls • 100% yours*
