import { createOptimizedPicture } from "../../scripts/aem.js";

/**
 * Copies Universal Editor instrumentation attributes from source to target element
 */
function copyUEAttributes(source, target) {
  if (!source || !target) return;

  const ueAttributes = [
    "data-aue-resource",
    "data-aue-type",
    "data-aue-label",
    "data-aue-model",
    "data-aue-filter",
  ];
  ueAttributes.forEach((attr) => {
    const value = source.getAttribute(attr);
    if (value) {
      target.setAttribute(attr, value);
    }
  });
}

export default function decorate(block) {
  const rows = [...block.querySelectorAll(":scope > div")];

  const leftColumnRow = rows[0];
  const leftCell = leftColumnRow?.children[0];

  const eyebrowEl = leftCell?.querySelector("h4");
  const headingEl = leftCell?.querySelector("h2");
  const descriptionEls = leftCell?.querySelectorAll("p") || [];

  const eyebrow = eyebrowEl?.textContent?.trim() || "";
  const heading = headingEl?.textContent?.trim() || "";
  const descriptionHTML = [...descriptionEls].map((p) => p.outerHTML).join("");

  // Store UE attributes from header elements
  const ueData = {
    eyebrow: eyebrowEl,
    heading: headingEl,
    description: descriptionEls[0],
  };

  const cardRows = rows.slice(1);
  const cards = [];

  cardRows.forEach((row) => {
    const columns = [...row.children];
    if (columns.length >= 2) {
      const imageCell = columns[0];
      const textCell = columns[1];
      const img = imageCell?.querySelector("img");
      const imageSrc = img?.src || "";
      const titleLine1El = textCell?.querySelector("h3");
      const titleLine2El = textCell?.querySelector("h4");
      const descEls = textCell?.querySelectorAll("p") || [];
      const linkElement = textCell?.querySelector("a");
      const titleLine1 = titleLine1El?.textContent?.trim() || "";
      const titleLine2 = titleLine2El?.textContent?.trim() || "";
      const cardDescription =
        [...descEls].map((p) => p.textContent?.trim()).join(" ") || "";
      const linkUrl = linkElement?.href || "";
      const imageAlt = img?.alt || `${titleLine1} ${titleLine2}`;

      if (imageSrc || titleLine1) {
        cards.push({
          imageSrc,
          imageAlt,
          titleLine1,
          titleLine2,
          description: cardDescription,
          link: linkUrl,
          // Store UE instrumentation for later transfer
          ueElements: {
            row,
            img,
            titleLine1: titleLine1El,
            titleLine2: titleLine2El,
            description: descEls[0],
            link: linkElement,
          },
        });
      }
    }
  });

  block.innerHTML = "";

  const container = document.createElement("div");
  container.className = "technologies-inner";

  const leftColumn = document.createElement("div");
  leftColumn.className = "technologies-left";

  if (eyebrow) {
    const eyebrowDiv = document.createElement("div");
    eyebrowDiv.className = "technologies-eyebrow";
    eyebrowDiv.textContent = eyebrow;
    copyUEAttributes(ueData.eyebrow, eyebrowDiv);
    leftColumn.appendChild(eyebrowDiv);
  }

  if (heading) {
    const headingDiv = document.createElement("h2");
    headingDiv.className = "technologies-heading";
    headingDiv.textContent = heading;
    copyUEAttributes(ueData.heading, headingDiv);
    leftColumn.appendChild(headingDiv);
  }

  if (descriptionHTML) {
    const descDiv = document.createElement("div");
    descDiv.className = "technologies-description";
    descDiv.innerHTML = descriptionHTML;
    copyUEAttributes(ueData.description, descDiv);
    leftColumn.appendChild(descDiv);
  }

  const rightColumn = document.createElement("div");
  rightColumn.className = "technologies-right";

  const cardsContainer = document.createElement("div");
  cardsContainer.className = "technologies-cards";

  cards.forEach((card, index) => {
    const cardEl = document.createElement("a");
    cardEl.className = "technologies-card";
    cardEl.href = card.link || "#";
    if (!card.link) {
      cardEl.addEventListener("click", (e) => e.preventDefault());
    }

    // Copy UE attributes from the original row to the card
    if (card.ueElements?.row) {
      copyUEAttributes(card.ueElements.row, cardEl);
    }

    const imageWrapper = document.createElement("div");
    imageWrapper.className = "technologies-card-image";

    if (card.imageSrc) {
      const picture = createOptimizedPicture(
        card.imageSrc,
        card.imageAlt,
        index === 0,
        [{ media: "(min-width: 900px)", width: "800" }, { width: "600" }]
      );
      imageWrapper.appendChild(picture);

      // Copy UE attributes from original img to new img
      const newImg = picture.querySelector("img");
      if (card.ueElements?.img && newImg) {
        copyUEAttributes(card.ueElements.img, newImg);
      }
    }

    const overlay = document.createElement("div");
    overlay.className = "technologies-card-overlay";

    const content = document.createElement("div");
    content.className = "technologies-card-content";

    const titleWrapper = document.createElement("div");
    titleWrapper.className = "technologies-card-title";

    if (card.titleLine1) {
      const titleLine1Span = document.createElement("span");
      titleLine1Span.className = "technologies-card-title-line1";
      titleLine1Span.textContent = card.titleLine1;
      copyUEAttributes(card.ueElements?.titleLine1, titleLine1Span);
      titleWrapper.appendChild(titleLine1Span);
    }

    if (card.titleLine2) {
      const titleLine2Span = document.createElement("span");
      titleLine2Span.className = "technologies-card-title-line2";
      titleLine2Span.textContent = card.titleLine2;
      copyUEAttributes(card.ueElements?.titleLine2, titleLine2Span);
      titleWrapper.appendChild(titleLine2Span);
    }

    content.appendChild(titleWrapper);

    if (card.description) {
      const descEl = document.createElement("div");
      descEl.className = "technologies-card-description";
      descEl.textContent = card.description;
      copyUEAttributes(card.ueElements?.description, descEl);
      content.appendChild(descEl);
    }

    const arrowEl = document.createElement("div");
    arrowEl.className = "technologies-card-arrow";
    content.appendChild(arrowEl);

    cardEl.appendChild(imageWrapper);
    cardEl.appendChild(overlay);
    cardEl.appendChild(content);
    cardsContainer.appendChild(cardEl);
  });

  rightColumn.appendChild(cardsContainer);

  container.appendChild(leftColumn);
  container.appendChild(rightColumn);
  block.appendChild(container);

  block.classList.add("technologies-block");
}
