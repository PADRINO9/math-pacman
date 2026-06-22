(() => {
  'use strict';

  const poster = document.getElementById('start-poster-image');
  if (!poster) return;

  const fallbackSrc = poster.currentSrc || poster.getAttribute('src');
  const sourceParts = Array.from(
    { length: 8 },
    (_, index) => `assets/poster-source/keflul-mobile-${String(index).padStart(2, '0')}.txt`
  );

  const revealFallback = () => {
    poster.classList.remove('poster-loading');
    poster.classList.add('poster-fallback');
  };

  Promise.all(
    sourceParts.map((path) =>
      fetch(`${path}?v=20260622-3`, { cache: 'force-cache' }).then((response) => {
        if (!response.ok) throw new Error(`Poster source failed: ${response.status}`);
        return response.text();
      })
    )
  )
    .then((parts) => {
      const base64 = parts.join('').replace(/\s+/g, '');
      if (base64.length !== 80144 || !base64.startsWith('UklGR')) {
        throw new Error('Poster source is incomplete');
      }

      const binary = atob(base64);
      if (binary.length !== 60108 || binary.slice(0, 4) !== 'RIFF' || binary.slice(8, 12) !== 'WEBP') {
        throw new Error('Poster binary failed validation');
      }

      const bytes = new Uint8Array(binary.length);
      for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
      }

      const objectUrl = URL.createObjectURL(new Blob([bytes], { type: 'image/webp' }));
      const revoke = () => URL.revokeObjectURL(objectUrl);

      poster.addEventListener('load', () => {
        poster.classList.remove('poster-loading', 'poster-fallback');
        poster.classList.add('poster-ready');
        window.setTimeout(revoke, 1500);
      }, { once: true });

      poster.addEventListener('error', () => {
        revoke();
        if (fallbackSrc) poster.src = fallbackSrc;
        revealFallback();
      }, { once: true });

      poster.src = objectUrl;
    })
    .catch((error) => {
      console.warn('The new start poster could not be loaded.', error);
      revealFallback();
    });
})();
