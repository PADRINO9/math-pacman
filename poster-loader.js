(() => {
  'use strict';

  const poster = document.getElementById('start-poster-image');
  if (!poster) return;

  const fallbackSrc = poster.currentSrc || poster.getAttribute('src');

  const sourceParts = [
    'assets/poster-source/chunk-00.txt',
    'assets/poster-source/chunk-01.txt',
    'assets/poster-source/chunk-02.txt',
    'assets/poster-source/chunk-03-04.txt',
    'assets/poster-source/chunk-05-06.txt',
    'assets/poster-source/chunk-07.txt'
  ];

  const revealFallback = () => {
    poster.classList.remove('poster-loading');
    poster.classList.add('poster-fallback');
  };

  Promise.all(
    sourceParts.map((path) =>
      fetch(`${path}?v=20260622-2`, { cache: 'force-cache' }).then((response) => {
        if (!response.ok) throw new Error(`Poster source failed: ${response.status}`);
        return response.text();
      })
    )
  )
    .then((parts) => {
      const base64 = parts.join('').replace(/\s+/g, '');
      if (base64.length !== 30092 || !base64.startsWith('UklGR')) {
        throw new Error('Poster source is incomplete');
      }

      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
      }

      const objectUrl = URL.createObjectURL(new Blob([bytes], { type: 'image/webp' }));
      const revoke = () => URL.revokeObjectURL(objectUrl);

      poster.addEventListener(
        'load',
        () => {
          poster.classList.remove('poster-loading', 'poster-fallback');
          poster.classList.add('poster-ready');
          window.setTimeout(revoke, 1500);
        },
        { once: true }
      );
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
