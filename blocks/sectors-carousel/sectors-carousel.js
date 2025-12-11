/**
 * Sectors Carousel Block
 */

import { moveInstrumentation } from '../../ue/scripts/ue-utils.js';

let sectorsCarouselId = 0;

const isUE = window.location.hostname.includes('adobeaemcloud')
  || window.location.hostname.includes('hlx.live')
  || window.location.hostname.includes('ue.da.live')
  || document.documentElement.classList.contains('adobe-ue-edit');

// #region agent log
console.log('[sectors-carousel] isUE detection:', { isUE, hostname: window.location.hostname, hasAdobeUeClass: document.documentElement.classList.contains('adobe-ue-edit') });
// #endregion

export function showSlide(block, slideIndex) {
  const slides = block.querySelectorAll('.sectors-slide');
  const navLinks = block.querySelectorAll('.sectors-nav-link');

  if (slides.length === 0) return;

  let realSlideIndex = slideIndex;
  if (slideIndex < 0) realSlideIndex = slides.length - 1;
  if (slideIndex >= slides.length) realSlideIndex = 0;

  slides.forEach((slide, idx) => {
    if (idx === realSlideIndex) {
      slide.classList.add('active');
      slide.setAttribute('aria-hidden', 'false');
    } else {
      slide.classList.remove('active');
      slide.setAttribute('aria-hidden', 'true');
    }
  });

  // Update active nav link
  navLinks.forEach((link, idx) => {
    if (idx === realSlideIndex) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'true');
    } else {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    }
  });

  block.dataset.activeSlide = realSlideIndex;
}

function setupAutoAdvance(block) {
  const slides = block.querySelectorAll('.sectors-slide');
  if (slides.length <= 1) return;

  let intervalId = null;
  const INTERVAL_MS = 3000;

  function advance() {
    const currentIndex = parseInt(block.dataset.activeSlide || '0', 10);
    const nextIndex = (currentIndex + 1) % slides.length;
    showSlide(block, nextIndex);
  }

  function start() {
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(advance, INTERVAL_MS);
  }

  function stop() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function reset() {
    stop();
    start();
  }

  // Store reset function on block for nav clicks
  block.resetAutoAdvance = reset;

  // Start auto-advance
  start();
}

function bindNavEvents(block) {
  const navLinks = block.querySelectorAll('.sectors-nav-link');

  // #region agent log
  console.log('[sectors-carousel] bindNavEvents:', { navLinkCount: navLinks.length, isUE });
  // #endregion

  navLinks.forEach((link, idx) => {
    link.addEventListener('click', (e) => {
      // #region agent log
      console.log('[sectors-carousel] nav-click:', { idx, isUE, willPreventDefault: !isUE });
      // #endregion
      e.preventDefault();
      showSlide(block, idx);
      // Reset the auto-advance timer when user clicks (only if not in UE)
      if (!isUE && block.resetAutoAdvance) {
        block.resetAutoAdvance();
      }
    });
  });
}

/**
 * UE Mode: Preserve original DOM structure for editability
 * Each row becomes a slide, keeping data-aue-* attributes intact
 */
function decorateForUE(block, rows) {
  // #region agent log
  console.log('[sectors-carousel] decorateForUE: preserving DOM structure', { rowCount: rows.length });
  // #endregion

  const slides = [];

  // Process each row as a slide, keeping original DOM
  rows.forEach((row, idx) => {
    const cells = row.querySelectorAll(':scope > div');
    if (cells.length < 3) return; // Need at least image, title, description

    // Add slide class to the row itself (preserves data-aue-* attributes)
    row.classList.add('sectors-slide');
    row.setAttribute('data-slide-index', idx);

    if (idx === 0) {
      row.classList.add('active');
      row.setAttribute('aria-hidden', 'false');
    } else {
      row.setAttribute('aria-hidden', 'true');
    }

    // Style the cells
    if (cells[0]) {
      cells[0].classList.add('sectors-slide-bg');
      const img = cells[0].querySelector('img');
      if (img) {
        img.classList.add('sectors-bg-image');
      }
    }

    if (cells[1]) {
      cells[1].classList.add('sectors-slide-title-cell');
    }

    if (cells[2]) {
      cells[2].classList.add('sectors-slide-description-cell');
    }

    if (cells[3]) {
      cells[3].classList.add('sectors-slide-link-cell');
    }

    // Extract title for nav
    const title = cells[1]?.textContent?.trim() || `Slide ${idx + 1}`;
    slides.push({ title, row });
  });

  if (slides.length === 0) {
    // #region agent log
    console.log('[sectors-carousel] decorateForUE: no valid slides found');
    // #endregion
    return;
  }

  // Create navigation sidebar (inserted at the beginning)
  const nav = document.createElement('div');
  nav.classList.add('sectors-nav');

  const navHeader = document.createElement('div');
  navHeader.classList.add('sectors-nav-header');
  navHeader.textContent = 'SETTORI';
  nav.append(navHeader);

  const navList = document.createElement('div');
  navList.classList.add('sectors-nav-list');

  slides.forEach((slide, idx) => {
    const navLink = document.createElement('a');
    navLink.href = '#';
    navLink.classList.add('sectors-nav-link');
    navLink.textContent = slide.title;
    navLink.setAttribute('aria-label', `Go to ${slide.title} slide`);
    if (idx === 0) {
      navLink.classList.add('active');
      navLink.setAttribute('aria-current', 'true');
    }
    navList.append(navLink);
  });

  nav.append(navList);

  // Wrap existing rows in a slides container
  const slidesContainer = document.createElement('div');
  slidesContainer.classList.add('sectors-slides');

  // Move all rows into the slides container (preserving their DOM/attributes)
  rows.forEach((row) => {
    slidesContainer.append(row);
  });

  // Clear and rebuild block with nav + slides container
  block.innerHTML = '';
  block.append(nav);
  block.append(slidesContainer);

  block.dataset.activeSlide = '0';
  bindNavEvents(block);

  // #region agent log
  console.log('[sectors-carousel] decorateForUE complete:', { slidesCreated: slides.length });
  // #endregion
}

/**
 * Production Mode: Full DOM rebuild with optimized structure
 */
function decorateForProduction(block, rows) {
  // #region agent log
  console.log('[sectors-carousel] decorateForProduction:', { rowCount: rows.length });
  // #endregion

  const slides = [];

  // Process data rows (4 columns: Background Image, Title, Description, Link)
  rows.forEach((row) => {
    const cells = row.querySelectorAll(':scope > div');
    if (cells.length < 4) return;

    const slideData = {
      backgroundImage: null,
      title: '',
      description: '',
      link: '',
    };

    // Column 1: Background image
    const bgCell = cells[0];
    const bgPicture = bgCell.querySelector('picture');
    const bgImg = bgCell.querySelector('img');
    if (bgPicture) {
      slideData.backgroundImage = bgPicture;
    } else if (bgImg) {
      slideData.backgroundImage = bgImg;
    }

    // Column 2: Title
    slideData.title = cells[1]?.textContent?.trim() || '';

    // Column 3: Description
    slideData.description = cells[2]?.textContent?.trim() || '';

    // Column 4: Link (optional)
    if (cells[3]) {
      const linkCell = cells[3];
      const linkAnchor = linkCell.querySelector('a');
      if (linkAnchor) {
        slideData.link = linkAnchor.href || linkAnchor.textContent.trim();
      } else {
        slideData.link = linkCell.textContent?.trim() || '';
      }
    }

    if (slideData.title && slideData.backgroundImage) {
      slides.push(slideData);
    }
  });

  if (slides.length === 0) {
    // #region agent log
    console.log('[sectors-carousel] decorateForProduction: no valid slides');
    // #endregion
    return;
  }

  // Navigation sidebar
  const nav = document.createElement('div');
  nav.classList.add('sectors-nav');

  const navHeader = document.createElement('div');
  navHeader.classList.add('sectors-nav-header');
  navHeader.textContent = 'SETTORI';
  nav.append(navHeader);

  const navList = document.createElement('div');
  navList.classList.add('sectors-nav-list');

  slides.forEach((slide, idx) => {
    const navLink = document.createElement('a');
    navLink.href = '#';
    navLink.classList.add('sectors-nav-link');
    navLink.textContent = slide.title;
    navLink.setAttribute('aria-label', `Go to ${slide.title} slide`);
    if (idx === 0) {
      navLink.classList.add('active');
      navLink.setAttribute('aria-current', 'true');
    }
    navList.append(navLink);
  });

  nav.append(navList);

  // Slides container
  const slidesContainer = document.createElement('div');
  slidesContainer.classList.add('sectors-slides');

  slides.forEach((slide, idx) => {
    const slideEl = document.createElement('div');
    slideEl.classList.add('sectors-slide');
    slideEl.setAttribute('data-slide-index', idx);
    if (idx === 0) {
      slideEl.classList.add('active');
    }
    slideEl.setAttribute('aria-hidden', idx === 0 ? 'false' : 'true');
    slideEl.setAttribute('aria-label', slide.title);

    // Background image
    const bgWrapper = document.createElement('div');
    bgWrapper.classList.add('sectors-slide-bg');
    if (slide.backgroundImage) {
      const imageElement = slide.backgroundImage.cloneNode(true);
      bgWrapper.append(imageElement);
    }
    slideEl.append(bgWrapper);

    const gradient = document.createElement('div');
    gradient.classList.add('sectors-slide-gradient');
    slideEl.append(gradient);

    const caption = document.createElement('div');
    caption.classList.add('sectors-slide-caption');

    const title = document.createElement('h3');
    title.classList.add('sectors-slide-title');
    title.textContent = slide.title;
    caption.append(title);

    const textWrapper = document.createElement('div');
    textWrapper.classList.add('sectors-slide-text');

    const description = document.createElement('p');
    description.textContent = slide.description;
    textWrapper.append(description);

    if (slide.link) {
      const link = document.createElement('a');
      link.href = slide.link;
      link.classList.add('sectors-slide-link');
      link.setAttribute('aria-label', `Learn more about ${slide.title}`);

      const icon = document.createElement('span');
      icon.classList.add('icon', 'icon-circle-arrow');
      const iconImg = document.createElement('img');
      iconImg.src = 'https://www.acerbisoem.com/wp-content/themes/acerbis/img/circle-gt.svg';
      iconImg.alt = '';
      iconImg.loading = 'lazy';
      iconImg.width = 58;
      iconImg.height = 58;
      icon.append(iconImg);
      link.append(icon);

      textWrapper.append(link);
    }

    caption.append(textWrapper);
    slideEl.append(caption);

    slidesContainer.append(slideEl);
  });

  block.innerHTML = '';
  block.append(nav);
  block.append(slidesContainer);

  block.dataset.activeSlide = '0';
  bindNavEvents(block);
  setupAutoAdvance(block);

  // #region agent log
  console.log('[sectors-carousel] decorateForProduction complete:', { slidesCreated: slides.length });
  // #endregion
}

export default async function decorate(block) {
  sectorsCarouselId += 1;
  const carouselId = sectorsCarouselId;

  block.setAttribute('id', `sectors-carousel-${carouselId}`);
  block.setAttribute('role', 'region');
  block.setAttribute('aria-label', 'Sectors Carousel');

  // Get all rows
  const rows = Array.from(block.querySelectorAll(':scope > div'));

  // #region agent log
  const blockAttrs = [...block.attributes].map((a) => ({ name: a.name, value: a.value }));
  const rowData = rows.map((row, idx) => {
    const cells = row.querySelectorAll(':scope > div');
    const rowAttrs = [...row.attributes].map((a) => ({ name: a.name, value: a.value }));
    return { rowIdx: idx, cellCount: cells.length, rowAttrs, hasDataAue: rowAttrs.some((a) => a.name.startsWith('data-aue')) };
  });
  console.log('[sectors-carousel] decorate-entry:', { carouselId, rowCount: rows.length, blockAttrs, rowData, isUE });
  // #endregion

  if (rows.length === 0) {
    // #region agent log
    console.log('[sectors-carousel] no rows found');
    // #endregion
    return;
  }

  // Use different decoration strategies for UE vs Production
  if (isUE) {
    decorateForUE(block, rows);
  } else {
    decorateForProduction(block, rows);
  }

  // #region agent log
  console.log('[sectors-carousel] decorate-end:', { isUE, slidesCreated: block.querySelectorAll('.sectors-slide').length });
  // #endregion
}
