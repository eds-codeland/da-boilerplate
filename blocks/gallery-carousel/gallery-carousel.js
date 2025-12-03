export default function decorate(block) {
  // Gallery Carousel component: 4-column image grid with lightbox
  // ✅ Universal Editor compatible: Preserves DOM and adds data attributes

  const rows = Array.from(block.querySelectorAll(':scope > div'));

  const container = document.createElement('div');
  container.classList.add('gallery-carousel-items');
  // ✅ Add data attribute for UE instrumentation
  container.setAttribute('data-editable', 'true');

  let imageCount = 0;

  // Process each row as a gallery item (skip first row which is the block name)
  rows.forEach((row, idx) => {
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
        // ✅ Add data attributes for UE instrumentation
        item.setAttribute('data-editable', 'true');
        item.setAttribute('data-item-index', imageCount);

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
        // ✅ Add data attributes for UE instrumentation
        imgElement.setAttribute('data-editable', 'image');

        galleryLink.append(imgElement);
        item.append(galleryLink);
        container.append(item);

      }
    }
  });

  // ✅ IMPORTANT: Append instead of replacing to preserve DOM for UE
  block.append(container);

  // Load Fancybox if available
  if (window.Fancybox) {
    window.Fancybox.bind('[data-fancybox="gallery"]', {
      on: {
        reveal: () => {
          // Optional: add custom behavior
        },
      },
    });
  }
}
