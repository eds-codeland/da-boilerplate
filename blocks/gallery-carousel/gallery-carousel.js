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

  // Process each row as a gallery item, matching carousel's createSlide pattern
  rows.forEach(row => {
    const cells = Array.from(row.querySelectorAll(':scope > div'));

    if (cells.length >= 1) {
      // Create li item matching carousel-slide structure
      const item = document.createElement('li');
      item.classList.add('gallery-carousel-item');
      item.setAttribute('data-aue-model', 'gallery-carousel-item');
      
      // Transfer UE instrumentation from original row if present
      const rowResource = row.getAttribute('data-aue-resource');
      if (rowResource) {
        item.setAttribute('data-aue-resource', rowResource);
      } else {
        item.setAttribute('data-aue-resource', `gallery-carousel/item-${slideIndex}`);
      }
      item.dataset.slideIndex = slideIndex;

      // Append original columns directly to item, matching carousel pattern
      cells.forEach((column, colIdx) => {
        column.classList.add(`gallery-carousel-slide-${colIdx === 0 ? 'image' : 'content'}`);
        
        // For image column, wrap picture/img in gallery link for lightbox
        if (colIdx === 0) {
          const picture = column.querySelector('picture');
          const img = picture ? picture.querySelector('img') : column.querySelector('img');
          
          if (picture || img) {
            // Determine href: prefer explicit link in second cell, else image src
            const secondCell = cells[1];
            const linkEl = secondCell?.querySelector('a');
            const href = (linkEl && linkEl.href) ? (img?.src || '') : (img?.src || '');
            
            // Create gallery link wrapper
            const galleryLink = document.createElement('a');
            galleryLink.href = href;
            galleryLink.classList.add('gallery-carousel-link');
            galleryLink.setAttribute('data-fancybox', 'gallery');
            galleryLink.setAttribute('data-caption', '');
            
            // Move picture/img into gallery link
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
            
            // Clear column and append gallery link
            column.innerHTML = '';
            column.append(galleryLink);
          }
        }
        
        item.append(column);
      });

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
