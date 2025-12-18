#!/usr/bin/env python3
"""
Jail Music Project - Playlist Generator
Scanează folderul mp3/ și generează automat playlist.json
"""

import os
import json
from pathlib import Path

def generate_playlist():
    """Scanează folderul mp3/ și creează playlist.json"""

    # Path-uri
    mp3_folder = Path("mp3")
    output_file = Path("playlist.json")

    # Verifică dacă folderul mp3 există
    if not mp3_folder.exists():
        print("❌ Error: Folderul 'mp3/' nu există!")
        return

    # Găsește toate fișierele MP3
    mp3_files = []
    for file in mp3_folder.iterdir():
        if file.is_file() and file.suffix.lower() == '.mp3':
            mp3_files.append(file.name)

    # Sortează alfabetic
    mp3_files.sort()

    if not mp3_files:
        print("⚠️  Warning: Nu s-au găsit fișiere MP3 în folderul 'mp3/'")
        print("   Adaugă fișiere .mp3 și rulează din nou scriptul.")
        return

    # Creează structura JSON
    playlist_data = {
        "songs": mp3_files
    }

    # Salvează în playlist.json
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(playlist_data, f, indent=2, ensure_ascii=False)

    # Afișează rezultate
    print("✅ Playlist generat cu succes!")
    print(f"\n📁 Fișiere găsite: {len(mp3_files)}")
    print("\n🎵 Melodii:")
    for idx, song in enumerate(mp3_files, 1):
        print(f"   {idx}. {song}")

    print(f"\n💾 Salvat în: {output_file.absolute()}")
    print("\n✨ Gata! Deschide index.html pentru a asculta muzica.")

if __name__ == "__main__":
    print("🎵 Jail Music - Playlist Generator\n")
    print("=" * 50)
    generate_playlist()
    print("=" * 50)
