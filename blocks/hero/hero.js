import { getMetadata } from '../../scripts/aem.js';

/**
 * Move UE instrumentation attributes from one element to another
 * @param {Element} from - source element
 * @param {Element} to - target element
 */
function moveInstrumentation(from, to) {
  if (!from || !to) return;
  [...from.attributes]
    .filter(({ nodeName }) => nodeName.startsWith('data-aue-') || nodeName.startsWith('data-richtext-'))
    .forEach(({ nodeName }) => {
      const value = from.getAttribute(nodeName);
      if (value) {
        to.setAttribute(nodeName, value);
        from.removeAttribute(nodeName);
      }
    });
}

export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];

  // Store original elements with their instrumentation before clearing
  const originalRows = rows.map((row) => ({
    element: row,
    cells: [...row.children],
  }));

  // Clear block content
  block.innerHTML = '';

  // Create hero-wrapper reference
  const wrapper = document.querySelector('.hero-wrapper');

  // Row 1: main image + title
  const row1 = originalRows[0];
  const mainImageCell = row1?.cells[0];
  const titleCell = row1?.cells[1];

  const mainPicture = mainImageCell?.querySelector('picture');
  const mainImage = mainImageCell?.querySelector('img');
  if (mainImage) {
    mainImage.classList.add('hero-main-image');
    // Move instrumentation from picture to image for UE
    if (mainPicture) {
      moveInstrumentation(mainPicture, mainImage);
    }
    block.appendChild(mainImage);
  }

  const overlay = document.createElement('div');
  overlay.classList.add('hero-overlay');

  // Metadata area
  const area = getMetadata('area');
  if (area) {
    const areaEl = document.createElement('span');
    areaEl.classList.add('hero-area');
    areaEl.textContent = area;
    overlay.appendChild(areaEl);
  }

  // Title
  if (titleCell) {
    const title = document.createElement('h1');
    title.textContent = titleCell.textContent;
    // Move instrumentation from original cell to new h1
    moveInstrumentation(titleCell, title);
    overlay.appendChild(title);
  }

  // Row 2: small image + description
  const row2 = originalRows[1];
  const smallImageCell = row2?.cells[0];
  const descCell = row2?.cells[1];

  // Description
  if (descCell) {
    const desc = document.createElement('p');
    desc.textContent = descCell.textContent;
    // Move instrumentation from original cell to new p
    moveInstrumentation(descCell, desc);
    overlay.appendChild(desc);
  }

  block.appendChild(overlay);

  // Small image
  const smallPicture = smallImageCell?.querySelector('picture');
  const smallImage = smallImageCell?.querySelector('img');
  if (smallImage) {
    smallImage.classList.add('hero-small-image');
    if (smallPicture) {
      moveInstrumentation(smallPicture, smallImage);
    }
    block.appendChild(smallImage);
  }

  // Row 3: optional two-column text
  if (originalRows[2]) {
    block.classList.add('with-text');
    const row3 = originalRows[2];
    const col1 = row3?.cells[0];
    const col2 = row3?.cells[1];

    const textRow = document.createElement('div');
    textRow.classList.add('hero-text-row');

    if (col1) {
      const leftText = document.createElement('div');
      leftText.classList.add('hero-text-left');
      leftText.innerHTML = col1.innerHTML;
      moveInstrumentation(col1, leftText);
      textRow.appendChild(leftText);
    }

    if (col2) {
      const rightText = document.createElement('div');
      rightText.classList.add('hero-text-right');
      rightText.innerHTML = col2.innerHTML;
      moveInstrumentation(col2, rightText);
      textRow.appendChild(rightText);
    }

    if (wrapper) {
      wrapper.appendChild(textRow);
    }
  }
}
