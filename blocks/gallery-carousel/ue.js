// blocks/gallery-carousel/ue.js
// Universal Editor event handlers for gallery-carousel block

export default function initUE(block) {
  // Handle when block is selected in Universal Editor
  block.addEventListener('ue:selected', () => {
    console.log('🎨 Gallery carousel selected in Universal Editor');
  });

  // Handle when content is updated in Universal Editor
  block.addEventListener('ue:updated', () => {
    console.log('🔄 Gallery carousel updated in Universal Editor');

    // Reinitialize Fancybox after content update
    if (window.Fancybox) {
      window.Fancybox.destroy();

      window.Fancybox.bind('[data-fancybox="gallery"]', {
        on: {
          reveal: (fancybox, slide) => {
            // Optional: add custom behavior
          }
        }
      });

      console.log('✅ Fancybox reinitialized');
    }
  });

  // Handle when block is added to page
  block.addEventListener('ue:added', () => {
    console.log('➕ Gallery carousel added to page');
  });

  // Handle when block is removed
  block.addEventListener('ue:removed', () => {
    console.log('➖ Gallery carousel removed from page');

    if (window.Fancybox) {
      window.Fancybox.destroy();
    }
  });
}
