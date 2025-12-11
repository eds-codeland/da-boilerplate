import initUE from './ue.js';

export default function decorate(block) {
  // Gallery Carousel component: image grid with lightbox, matching carousel structure

  // Set UE model attribute for Universal Editor
  block.setAttribute('data-aue-model', 'gallery-carousel');

  // Idempotency: if already decorated, do nothing
  if (block.querySelector(':scope > .gallery-carousel-items')) {
    return;
  }

  const rows = Array.from(block.querySelectorAll(':scope > div'));

  // Create ul wrapper matching carousel structure
  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('gallery-carousel-items');

  let slideIndex = 0;

  // Process each row as a gallery item by MOVING existing media into items
  rows.forEach(row => {
    const cells = Array.from(row.querySelectorAll(':scope > div'));

    if (cells.length >= 1) {
      const firstCell = cells[0];
      const secondCell = cells[1];

      // Prefer a <picture> if present, else <img>
      const picture = firstCell.querySelector('picture') || secondCell?.querySelector('picture');
      let img = picture ? picture.querySelector('img') : (firstCell.querySelector('img') || secondCell?.querySelector('img'));
      if (!img) {
        return;
      }

      // Determine href: prefer an explicit link in second cell, else the image src
      const linkEl = secondCell?.querySelector('a');
      const href = (linkEl && linkEl.href) ? linkEl.href : img.src;

      // Create li item matching carousel-slide structure
      const item = document.createElement('li');
      item.classList.add('gallery-carousel-item');
      item.setAttribute('data-aue-model', 'gallery-carousel-item');
      item.setAttribute('data-aue-resource', `gallery-carousel/item-${slideIndex}`);
      item.dataset.slideIndex = slideIndex;

      // Create gallery link with lightbox
      const galleryLink = document.createElement('a');
      galleryLink.href = href;
      galleryLink.classList.add('gallery-carousel-link');
      galleryLink.setAttribute('data-fancybox', 'gallery');
      galleryLink.setAttribute('data-caption', '');

      // Move media node into the link, preserving UE instrumentation
      if (picture) {
        galleryLink.append(picture);
        const movedImg = picture.querySelector('img');
        if (movedImg) {
          movedImg.classList.add('gallery-carousel-image');
          movedImg.loading = 'lazy';
        }
      } else if (img) {
        galleryLink.append(img);
        img.classList.add('gallery-carousel-image');
        img.loading = 'lazy';
      }

      item.append(galleryLink);
      slidesWrapper.append(item);

      slideIndex += 1;

      // Remove the now-empty row from the DOM to avoid duplication
      row.remove();
    }
  });

  // Prepend ul wrapper to block, matching carousel structure
  block.prepend(slidesWrapper);

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
