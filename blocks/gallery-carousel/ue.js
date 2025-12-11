export default function initUE(block) {
  // Universal Editor event handlers for gallery-carousel block

  block.addEventListener('ue:updated', () => {
    // Reinitialize Fancybox after content updates
    if (window.Fancybox) {
      window.Fancybox.destroy();
      window.Fancybox.bind('[data-fancybox="gallery"]', {
        on: {
          reveal: () => {
            // Optional: add custom behavior
          },
        },
      });
    }
  });

  block.addEventListener('ue:removed', () => {
    // Clean up Fancybox when block is removed
    if (window.Fancybox) {
      window.Fancybox.destroy();
    }
  });
}
