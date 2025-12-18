# 📁 MP3 Folder

## Instrucțiuni

Adaugă fișierele tale MP3 în acest folder.

### Format Recomandat

Pentru cea mai bună experiență, folosește formatul:

```
Artist - Song Title.mp3
```

**Exemple:**
- `The Weeknd - Blinding Lights.mp3`
- `Dua Lipa - Levitating.mp3`
- `Imagine Dragons - Believer.mp3`

### Dacă nu folosești formatul Artist - Title

Poți folosi orice nume, dar:
- Artistul va apărea ca "Unknown Artist"
- Titlul va fi numele fișierului (fără .mp3)

**Exemple:**
- `my-favorite-song.mp3` → Unknown Artist - my-favorite-song
- `awesome_track.mp3` → Unknown Artist - awesome_track

## Actualizare Playlist

**IMPORTANT:** După ce adaugi fișiere MP3 aici, trebuie să actualizezi fișierul `playlist.json` din folderul principal!

Deschide `playlist.json` și adaugă numele fișierelor în array-ul "songs":

```json
{
  "songs": [
    "The Weeknd - Blinding Lights.mp3",
    "Dua Lipa - Levitating.mp3",
    "my-favorite-song.mp3"
  ]
}
```

## Testare Locală

Pentru a testa local înainte de a face push pe GitHub:

1. Adaugă fișierele MP3 aici
2. Actualizează `playlist.json`
3. Deschide `index.html` în browser
4. Sau rulează un server local:
   ```bash
   python -m http.server 8000
   ```

## Tips

- Păstrează numele fișierelor simple (evită caractere speciale)
- Verifică că fișierele sunt în format `.mp3`
- Numele din `playlist.json` trebuie să match exact cu numele fișierelor
- Ordinea din `playlist.json` = ordinea din player

---

**Gata?** Adaugă melodiile și bucură-te de muzică! 🎵
