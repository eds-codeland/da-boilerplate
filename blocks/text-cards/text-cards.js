export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement("ul");
  const isAdvantages = block.classList.contains("advantages");

  [...block.children].forEach((row) => {
    const li = document.createElement("li");
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      div.className = "text-card-body";

      // Special handling for advantages variant
      if (isAdvantages) {
        // Find the picture element dynamically
        const pictureElement = div.querySelector("picture");

        if (pictureElement) {
          // Get the parent element of the picture (could be h4, p, or any other element)
          // If picture is standalone, use the picture element itself
          let iconElement = pictureElement.parentElement;

          // Check if the parent is the text-card-body itself (meaning picture is direct child)
          if (iconElement === div) {
            iconElement = pictureElement;
          } else {
            // If picture has a wrapper, check if it's a semantic element
            const semanticParent = pictureElement.closest(
              "h4, p, div:not(.text-card-body), span"
            );
            if (semanticParent && semanticParent !== div) {
              iconElement = semanticParent;
            } else {
              iconElement = pictureElement;
            }
          }

          // Create wrapper for icon
          const iconWrapper = document.createElement("div");
          iconWrapper.className = "advantages-icon";
          iconWrapper.appendChild(iconElement.cloneNode(true));

          // Remove the original icon element from div
          if (iconElement.parentElement === div) {
            iconElement.remove();
          }

          // Create wrapper for content (all remaining elements)
          const contentWrapper = document.createElement("div");
          contentWrapper.className = "advantages-content";

          // Add all remaining children to content wrapper
          while (div.firstChild) {
            contentWrapper.appendChild(div.firstChild);
          }

          // Clear and rebuild the structure
          div.innerHTML = "";
          div.appendChild(iconWrapper);
          div.appendChild(contentWrapper);
        }
      }
    });
    ul.append(li);
  });

  // replace images with optimized versions

  block.replaceChildren(ul);
}
