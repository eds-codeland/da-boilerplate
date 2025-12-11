import initUE from './ue.js';

export default function decorate(block) {
  // Gallery Carousel component: 4-column image grid with lightbox

  const rows = Array.from(block.querySelectorAll(':scope > div'));

  const container = document.createElement('div');
  container.classList.add('gallery-carousel-items');

  let imageCount = 0;

  // Process each row as a gallery item (skip first row which is the block name)
  rows.forEach(row => {
    const cells = Array.from(row.querySelectorAll(':scope > div'));

    if (cells.length >= 1) {
      let imageUrl = null;
      let caption = '';

      const firstCell = cells[0];
      const secondCell = cells[1];

      // Check first cell for image
      let img = firstCell.querySelector('img');
      if (img) {
        imageUrl = img.src;
        caption = img.alt || '';
      }

      // Check second cell for image (pasted images)
      if (!imageUrl && secondCell) {
        img = secondCell.querySelector('img');
        if (img) {
          imageUrl = img.src;
          caption = img.alt || '';
        }
      }

      // Check second cell for link (URL)
      const link = secondCell?.querySelector('a');
      if (link && !imageUrl) {
        imageUrl = link.href;
        caption = link.textContent || '';
      } else if (link && imageUrl) {
        imageUrl = link.href;
      }

      // Check for text content in second cell
      if (!imageUrl && secondCell) {
        const text = secondCell.textContent.trim();
        if (text.startsWith('http')) {
          imageUrl = text;
        }
      }

      if (imageUrl) {
        imageCount += 1;
        const item = document.createElement('div');
        item.classList.add('gallery-carousel-item');

        // Create gallery link with lightbox
        const galleryLink = document.createElement('a');
        galleryLink.href = imageUrl;
        galleryLink.classList.add('gallery-carousel-link');
        galleryLink.setAttribute('data-fancybox', 'gallery');
        // Don't show URL as caption - leave it empty
        galleryLink.setAttribute('data-caption', '');

        // Create image
        const imgElement = document.createElement('img');
        imgElement.src = imageUrl;
        imgElement.alt = caption;
        imgElement.classList.add('gallery-carousel-image');
        imgElement.loading = 'lazy';
        // Add data attributes for UE targeting
        imgElement.setAttribute(`data-image-${imageCount}`, imageUrl);
        imgElement.setAttribute(`data-alt-${imageCount}`, caption);

        galleryLink.append(imgElement);
        item.append(galleryLink);
        container.append(item);
      }
    }
  });

  // Hide original rows but keep them in DOM (for UE compatibility)
  Array.from(block.querySelectorAll(':scope > div')).forEach(row => {
    row.style.display = 'none';
    row.style.visibility = 'hidden';
    row.style.height = '0';
    row.style.overflow = 'hidden';
  });

  // IMPORTANT: Append instead of replacing to preserve DOM for UE
  block.append(container);

  // Load Fancybox if available - with proper initialization
  const initFancybox = () => {
    if (window.Fancybox) {
      window.Fancybox.bind('[data-fancybox="gallery"]', {
        on: {
          reveal: () => {
            // Optional: add custom behavior
          },
        },
        // Enable all toolbar buttons
        toolbar: {
          display: {
            left: ['infobar'],
            middle: ['zoomIn', 'zoomOut', 'toggle1to1', 'rotateCW', 'flipX'],
            right: ['slideshow', 'fullscreen', 'thumbs', 'close'],
          },
        },
        // Enable image counter
        counter: true,
        // Auto-fit images
        autoSize: true,
        // Enable keyboard navigation
        keyboard: true,
      });
      return true;
    }
    return false;
  };

  // Try to initialize immediately
  if (!initFancybox()) {
    // Fallback: try after a short delay if Fancybox isn't ready yet
    setTimeout(initFancybox, 100);
    // Try again after longer delay
    setTimeout(initFancybox, 500);
  }

  // Initialize UE event handlers
  initUE(block);
}
