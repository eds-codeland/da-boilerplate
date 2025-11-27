/**
 * Factories Block
 * Renders items as cards with image, name, and location.
 */

function moveChildren(source, target) {
  if (!source) return;
  while (source.firstChild) {
    target.append(source.firstChild);
  }
}

export default function decorate(block) {
  const rows = [...block.children];
  const grid = document.createElement('div');
  grid.className = 'factories-grid';

  rows.forEach((row) => {
    const card = document.createElement('article');
    card.className = 'factory-card';

    const cells = [...row.children];

    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'factory-image';
    moveChildren(cells[0], imageWrapper);

    const nameWrapper = document.createElement('div');
    nameWrapper.className = 'factory-name';
    if (cells[1]) {
      const nameFragment = document.createDocumentFragment();
      moveChildren(cells[1], nameFragment);
      const nameText = nameFragment.textContent.trim();
      if (nameText) {
        const heading = document.createElement('h3');
        heading.textContent = nameText;
        nameWrapper.append(heading);
      }
    }

    const locationWrapper = document.createElement('div');
    locationWrapper.className = 'factory-location';
    if (cells[2]) {
      moveChildren(cells[2], locationWrapper);
    }

    card.append(imageWrapper, nameWrapper, locationWrapper);
    grid.append(card);
  });

  block.replaceChildren(grid);
}
