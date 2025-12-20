# 🔧 Configurare CORS pentru R2 Bucket

## Problema
Muzica nu se redă pentru că browser-ul blochează fișierele audio din cauza CORS (Cross-Origin Resource Sharing).

## Soluție: Configurare CORS în Cloudflare Dashboard

### Pasul 1: Deschide Cloudflare R2 Dashboard
1. Mergi la: https://dash.cloudflare.com/
2. Click pe **R2** în meniul din stânga
3. Click pe bucket-ul **undercover-music**

### Pasul 2: Configurează CORS
1. Click pe tab-ul **Settings**
2. Scroll jos la secțiunea **CORS Policy**
3. Click pe **Edit CORS policy** sau **Add CORS policy**

### Pasul 3: Adaugă această configurație JSON

**IMPORTANT**: Copiază EXACT acest JSON și înlocuiește tot ce e acolo:

```json
[
  {
    "AllowedOrigins": [
      "https://dutatiberiu.github.io"
    ],
    "AllowedMethods": [
      "GET",
      "HEAD"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [
      "Content-Length",
      "Content-Type",
      "Content-Range",
      "Accept-Ranges",
      "ETag"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

### Ce face fiecare setare:

- **AllowedOrigins**: Permite accesul de la GitHub Pages (site-ul tău)
- **AllowedMethods**: Permite GET (descărcare) și HEAD (verificare existență)
- **AllowedHeaders**: Permite toate header-urile trimise de browser
- **ExposeHeaders**: Expune header-urile necesare pentru streaming audio
  - `Content-Length` - dimensiunea fișierului
  - `Content-Type` - tipul fișierului (audio/mpeg, etc)
  - `Content-Range` - pentru redare parțială (seek în melodie)
  - `Accept-Ranges` - permite browser-ul să ceară bucăți din fișier
  - `ETag` - pentru caching
- **MaxAgeSeconds**: Browser-ul memorează permisiunile 1 oră

### Pasul 4: Salvează
1. Click pe **Save** sau **Apply**
2. Așteaptă 1-2 minute pentru propagare

### Pasul 5: Testează
1. Deschide site-ul în **incognito mode**: https://dutatiberiu.github.io/jail-music-project/
2. Apasă F12 pentru Console
3. Încearcă să redai o melodie
4. Verifică în Console dacă mai apar erori CORS

---

## Dacă tot nu merge: Soluție Alternativă - Cloudflare Worker

Dacă CORS policy nu rezolvă problema (de exemplu, dacă Cloudflare R2 are limitări), putem crea un **Cloudflare Worker** care face proxy și adaugă automat CORS headers.

Worker-ul ar funcționa astfel:
- Request: `https://worker-url/path/to/song.mp3`
- Worker preia fișierul din R2
- Worker adaugă CORS headers
- Browser primește fișier cu CORS corect

Spune-mi dacă vrei să mergem pe această variantă!

---

## Debugging

### Verifică dacă CORS funcționează:
Deschide Console în browser (F12) și rulează:

```javascript
fetch('https://pub-2c614bd24cca4ed6948f5bf497b0cfe1.r2.dev/Tiberiu/Ed%20Sheeran/Ed%20Sheeran%20%20-%20%2B%20(Plus)/01%20The%20A%20Team.mp3', {
  method: 'HEAD'
})
.then(response => console.log('✅ CORS works!', response.status))
.catch(error => console.error('❌ CORS error:', error))
```

Dacă vezi `✅ CORS works!` → totul e OK, problema e altundeva
Dacă vezi `❌ CORS error` → CORS policy încă nu e corect
