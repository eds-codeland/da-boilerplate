// blocks/gallery-carousel/ue.js
// Universal Editor event handlers for gallery-carousel block

export default function initUE(block) {
  // Handle when block is selected in Universal Editor
  block.addEventListener('ue:selected', () => {
    // Block selected in Universal Editor
  });

  // Handle when content is updated in Universal Editor
  block.addEventListener('ue:updated', () => {
    // Reinitialize Fancybox after content update
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

  // Handle when block is added to page
  block.addEventListener('ue:added', () => {
    // Block added to page
  });

  // Handle when block is removed
  block.addEventListener('ue:removed', () => {
    // Clean up Fancybox when block is removed
    if (window.Fancybox) {
      window.Fancybox.destroy();
    }
  });
}
