import initUE from './ue.js';

export default function decorate(block) {
  // Gallery Carousel component: image grid with lightbox, matching carousel structure

  // Set UE model attribute for Universal Editor
  block.setAttribute('data-aue-model', 'gallery-carousel');
  // Ensure UE knows this block accepts children of type gallery-carousel-item
  block.setAttribute('data-aue-filter', 'gallery-carousel');
  block.setAttribute('data-aue-type', 'container');
  block.setAttribute('data-aue-behavior', 'component');
  // Helpful label in UE tree
  if (!block.getAttribute('data-aue-label')) {
    block.setAttribute('data-aue-label', 'Gallery Carousel');
  }

  // Idempotency: if already enhanced, do nothing
  if (block.classList.contains('gallery-carousel--enhanced')) {
    return;
  }

  const isUE = window.location.hostname.includes('ue.da.live');

  // If legacy markup exists (<ul>/<li>), migrate items to direct children.
  const legacyList = block.querySelector(':scope > ul.gallery-carousel-items');
  if (legacyList) {
    const legacyItems = Array.from(legacyList.querySelectorAll(':scope > li.gallery-carousel-item'));
    legacyItems.forEach((li) => {
      const div = document.createElement('div');
      // Copy instrumentation + other useful attrs
      Array.from(li.attributes).forEach(({ name, value }) => {
        div.setAttribute(name, value);
      });
      div.classList.add('gallery-carousel-item');
      // Move children
      while (li.firstChild) {
        div.appendChild(li.firstChild);
      }
      block.insertBefore(div, legacyList);
      li.remove();
    });
    legacyList.remove();
  }

  const items = Array.from(block.querySelectorAll(':scope > div'))
    .filter((el) => el.getAttribute('data-aue-model') === 'gallery-carousel-item' || el.querySelector('picture, img'));

  items.forEach((item, index) => {
    item.classList.add('gallery-carousel-item');
    if (!item.getAttribute('data-slide-index')) {
      item.setAttribute('data-slide-index', index);
    }

    if (item.getAttribute('data-aue-model') === 'gallery-carousel-item') {
      if (!item.getAttribute('data-aue-type')) {
        item.setAttribute('data-aue-type', 'component');
      }
      if (!item.getAttribute('data-aue-label')) {
        item.setAttribute('data-aue-label', 'Gallery Item');
      }
    }

    // Enhance inner image: wrap picture/img with a link for Fancybox (not in UE), but do not replace the UE item node.
    const existingLink = item.querySelector(':scope a.gallery-carousel-link');
    const picture = item.querySelector('picture');
    const img = item.querySelector('img');

    if (!img) {
      return;
    }

    img.classList.add('gallery-carousel-image');
    img.loading = 'lazy';

    // In Universal Editor we must keep the DOM simple (no <a> wrapper), otherwise the model selectors
    // won't match and the Image field will appear empty.
    if (isUE) {
      if (existingLink) {
        const target = picture || img;
        existingLink.parentNode.insertBefore(target, existingLink);
        existingLink.remove();
      }
      return;
    }

    // If already linked, just ensure Fancybox attrs
    if (existingLink) {
      existingLink.setAttribute('data-fancybox', 'gallery');
      existingLink.setAttribute('data-caption', '');
      return;
    }

    // Wrap picture (preferred) or img with a link
    const link = document.createElement('a');
    link.href = img.src || '';
    link.classList.add('gallery-carousel-link');
    link.setAttribute('data-fancybox', 'gallery');
    link.setAttribute('data-caption', '');

    const target = picture || img;
    target.parentNode.insertBefore(link, target);
    link.appendChild(target);
  });

  block.classList.add('gallery-carousel--enhanced');

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
