import { getMetadata } from '../../scripts/aem.js';

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

function createTextElement(tag, sourceCell, className) {
  const element = document.createElement(tag);
  if (className) element.classList.add(className);
  element.textContent = sourceCell.textContent;
  moveInstrumentation(sourceCell, element);
  return element;
}

function extractImage(cell) {
  const picture = cell?.querySelector('picture');
  const img = cell?.querySelector('img');
  if (img && picture) {
    moveInstrumentation(picture, img);
  }
  return img;
}

export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const originalRows = rows.map((row) => ({ cells: [...row.children] }));

  block.innerHTML = '';

  const wrapper = document.querySelector('.hero-wrapper');
  const [row1, row2, row3] = originalRows;

  // Main image
  const mainImage = extractImage(row1?.cells[0]);
  if (mainImage) {
    mainImage.classList.add('hero-main-image');
    block.appendChild(mainImage);
  }

  // Overlay with area, title, and description
  const overlay = document.createElement('div');
  overlay.classList.add('hero-overlay');

  const area = getMetadata('area');
  if (area) {
    const areaEl = document.createElement('span');
    areaEl.classList.add('hero-area');
    areaEl.textContent = area;
    overlay.appendChild(areaEl);
  }

  if (row1?.cells[1]) {
    overlay.appendChild(createTextElement('h1', row1.cells[1]));
  }

  if (row2?.cells[1]) {
    overlay.appendChild(createTextElement('p', row2.cells[1]));
  }

  block.appendChild(overlay);

  // Small image
  const smallImage = extractImage(row2?.cells[0]);
  if (smallImage) {
    smallImage.classList.add('hero-small-image');
    block.appendChild(smallImage);
  }

  // Optional two-column text row
  if (row3) {
    block.classList.add('with-text');
    const textRow = document.createElement('div');
    textRow.classList.add('hero-text-row');

    if (row3.cells[0]) {
      const leftText = document.createElement('div');
      leftText.classList.add('hero-text-left');
      leftText.innerHTML = row3.cells[0].innerHTML;
      moveInstrumentation(row3.cells[0], leftText);
      textRow.appendChild(leftText);
    }

    if (row3.cells[1]) {
      const rightText = document.createElement('div');
      rightText.classList.add('hero-text-right');
      rightText.innerHTML = row3.cells[1].innerHTML;
      moveInstrumentation(row3.cells[1], rightText);
      textRow.appendChild(rightText);
    }

    if (wrapper) {
      wrapper.appendChild(textRow);
    }
  }
}
