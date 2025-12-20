/**
 * Cloudflare Worker - R2 Music Proxy with CORS
 *
 * Acest Worker face proxy la fișierele din R2 și adaugă automat CORS headers
 * pentru a permite redarea audio de pe GitHub Pages.
 *
 * Setup:
 * 1. Cloudflare Dashboard → Workers & Pages → Create Application
 * 2. Create Worker → Paste acest cod
 * 3. Deploy
 * 4. Settings → Variables → R2 Bucket Bindings → Add binding:
 *    - Variable name: MUSIC_BUCKET
 *    - R2 bucket: undercover-music
 * 5. Copiază URL-ul worker-ului (ex: https://music-proxy.yourname.workers.dev)
 * 6. Actualizează baseUrl în playlist.json cu URL-ul worker-ului
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Remove leading slash from pathname to get the R2 key
    const objectKey = url.pathname.substring(1);

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return handleOptions(request);
    }

    // Only allow GET and HEAD requests
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method Not Allowed', {
        status: 405,
        headers: {
          'Allow': 'GET, HEAD, OPTIONS'
        }
      });
    }

    try {
      // Get object from R2
      const object = await env.MUSIC_BUCKET.get(objectKey);

      if (object === null) {
        return new Response('File Not Found', {
          status: 404,
          headers: corsHeaders()
        });
      }

      // Prepare headers
      const headers = new Headers();

      // Add CORS headers
      Object.entries(corsHeaders()).forEach(([key, value]) => {
        headers.set(key, value);
      });

      // Add R2 object metadata headers
      object.writeHttpMetadata(headers);
      headers.set('etag', object.httpEtag);

      // Add caching headers (24 hours)
      headers.set('Cache-Control', 'public, max-age=86400');

      // Content type based on file extension
      const ext = objectKey.split('.').pop().toLowerCase();
      const contentTypes = {
        'mp3': 'audio/mpeg',
        'flac': 'audio/flac',
        'm4a': 'audio/mp4',
        'wav': 'audio/wav',
        'ogg': 'audio/ogg'
      };
      headers.set('Content-Type', contentTypes[ext] || 'application/octet-stream');

      // Handle range requests (for seeking in audio)
      const range = request.headers.get('Range');
      if (range) {
        return handleRangeRequest(object, range, headers);
      }

      // Return full file
      return new Response(object.body, {
        headers
      });

    } catch (error) {
      return new Response(`Error: ${error.message}`, {
        status: 500,
        headers: corsHeaders()
      });
    }
  }
};

/**
 * CORS headers for audio streaming
 */
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',  // Or specifically: 'https://dutatiberiu.github.io'
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Expose-Headers': 'Content-Length, Content-Type, Content-Range, Accept-Ranges, ETag, Cache-Control',
    'Access-Control-Max-Age': '86400'
  };
}

/**
 * Handle CORS preflight requests
 */
function handleOptions(request) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders()
  });
}

/**
 * Handle range requests for audio seeking
 */
function handleRangeRequest(object, rangeHeader, headers) {
  const parts = rangeHeader.replace(/bytes=/, '').split('-');
  const start = parseInt(parts[0], 10);
  const end = parts[1] ? parseInt(parts[1], 10) : object.size - 1;
  const chunkSize = (end - start) + 1;

  headers.set('Content-Range', `bytes ${start}-${end}/${object.size}`);
  headers.set('Content-Length', chunkSize.toString());
  headers.set('Accept-Ranges', 'bytes');

  return new Response(object.body, {
    status: 206,
    headers
  });
}
