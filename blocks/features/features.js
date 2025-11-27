/**
 * Features Block
 * Renders cards with number, colored title, description, and link.
 */

const DESKTOP_QUERY = '(min-width: 900px)';
const isDesktop = window.matchMedia(DESKTOP_QUERY);

function ensureLazyImage(node) {
  if (!node) return;
  if (node.tagName === 'IMG') {
    node.setAttribute('loading', node.getAttribute('loading') || 'lazy');
    node.setAttribute('decoding', node.getAttribute('decoding') || 'async');
  }
  node.querySelectorAll?.('img').forEach((img) => {
    img.setAttribute('loading', img.getAttribute('loading') || 'lazy');
    img.setAttribute('decoding', img.getAttribute('decoding') || 'async');
  });
}

function moveChildren(source, target) {
  if (!source || !target) return;
  [...source.childNodes].forEach((child) => {
    if (child.nodeType === Node.ELEMENT_NODE) ensureLazyImage(child);
    target.append(child);
  });
}

function buildFeature(row, index) {
  const columns = [...row.children];
  const feature = document.createElement('article');
  feature.className = 'feature-card';
  feature.setAttribute('role', 'listitem');
  feature.setAttribute('tabindex', '0');

  // Number column
  const numberWrapper = document.createElement('div');
  numberWrapper.className = 'feature-number';
  const candidate = columns[0]?.textContent?.trim();
  const numericMatch = candidate && candidate.match(/\d+/);
  const numberValue = numericMatch ? numericMatch[0] : String(index + 1);
  numberWrapper.textContent = numberValue.padStart(2, '0');

  // Title column (highlighted)
  const titleWrapper = document.createElement('h3');
  titleWrapper.className = 'feature-title';
  const titleSpan = document.createElement('span');
  titleSpan.className = 'feature-title-text';
  const titleText = columns[1]?.textContent?.trim();
  titleSpan.textContent = titleText || `Feature ${index + 1}`;
  titleWrapper.append(titleSpan);

  // Description column
  const descriptionWrapper = document.createElement('div');
  descriptionWrapper.className = 'feature-description';
  if (columns[2]) {
    moveChildren(columns[2], descriptionWrapper);
  }

  // Link column
  const linkWrapper = document.createElement('div');
  linkWrapper.className = 'feature-link';
  let linkElement = null;
  if (columns[3]) {
    linkElement = columns[3].querySelector('a');
    if (!linkElement && columns[3].childNodes.length) {
      const generatedLink = document.createElement('a');
      generatedLink.href = '#';
      generatedLink.textContent = columns[3].textContent.trim();
      columns[3].textContent = '';
      columns[3].append(generatedLink);
      linkElement = generatedLink;
    }
  }

  if (!linkElement) {
    linkElement = row.querySelector('a');
  }

  if (linkElement) {
    const labelText = linkElement.textContent.trim() || `Scopri di più su ${titleSpan.textContent}`;
    linkElement.textContent = '';
    const labelSpan = document.createElement('span');
    labelSpan.className = 'feature-link-label';
    labelSpan.textContent = labelText;
    linkElement.setAttribute('aria-label', labelText);
    linkElement.classList.add('feature-link-anchor');
    linkElement.classList.remove('button');

    const iconSpan = document.createElement('span');
    iconSpan.className = 'feature-link-icon';
    iconSpan.setAttribute('aria-hidden', 'true');

    linkElement.append(labelSpan, iconSpan);
    ensureLazyImage(linkElement);
    linkWrapper.append(linkElement);
  }

  feature.append(numberWrapper, titleWrapper, descriptionWrapper, linkWrapper);
  return feature;
}

function enableSwipe(scroller) {
  let pointerId = null;
  let startX = 0;
  let scrollLeft = 0;

  scroller.addEventListener('pointerdown', (event) => {
    if (isDesktop.matches) return;
    pointerId = event.pointerId;
    startX = event.clientX;
    scrollLeft = scroller.scrollLeft;
    scroller.setPointerCapture(pointerId);
    scroller.classList.add('is-dragging');
  });

  scroller.addEventListener('pointermove', (event) => {
    if (pointerId === null) return;
    const deltaX = event.clientX - startX;
    scroller.scrollLeft = scrollLeft - deltaX;
  });

  const endDrag = (event) => {
    if (pointerId === null) return;
    if (event.pointerId && event.pointerId !== pointerId) return;
    scroller.releasePointerCapture(pointerId);
    pointerId = null;
    scroller.classList.remove('is-dragging');
  };

  scroller.addEventListener('pointerup', endDrag);
  scroller.addEventListener('pointercancel', endDrag);
  scroller.addEventListener('pointerleave', endDrag);
}

function enableKeyboardNavigation(scroller) {
  const getItems = () => [...scroller.querySelectorAll('.feature-card')];

  scroller.addEventListener('keydown', (event) => {
    const keys = ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    const items = getItems();
    const currentIndex = items.indexOf(event.target.closest('.feature-card'));
    if (currentIndex === -1) return;

    let targetIndex = currentIndex;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') targetIndex = Math.min(items.length - 1, currentIndex + 1);
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') targetIndex = Math.max(0, currentIndex - 1);
    if (event.key === 'Home') targetIndex = 0;
    if (event.key === 'End') targetIndex = items.length - 1;

    if (targetIndex !== currentIndex) {
      event.preventDefault();
      const target = items[targetIndex];
      target.focus({ preventScroll: false });
    }
  });
}

export default function decorate(block) {
  const rows = [...block.children];
  const grid = document.createElement('div');
  grid.className = 'features-grid';

  const scroller = document.createElement('div');
  scroller.className = 'features-scroller';
  scroller.setAttribute('role', 'list');

  rows.forEach((row, index) => {
    const feature = buildFeature(row, index);
    scroller.append(feature);
  });

  grid.append(scroller);
  block.replaceChildren(grid);
  block.classList.add('features-block');
  block.setAttribute('role', 'region');
  block.setAttribute('aria-label', 'Key features');

  enableSwipe(scroller);
  enableKeyboardNavigation(scroller);
}

