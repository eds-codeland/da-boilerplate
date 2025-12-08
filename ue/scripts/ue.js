/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import { showSlide } from "../../blocks/carousel/carousel.js";
import { moveInstrumentation } from "./ue-utils.js";

const setupObservers = () => {
  const mutatingBlocks = document.querySelectorAll(
    "div.text-cards,div.cards, div.carousel, div.accordion, div.features, div.technologies"
  );
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList" && mutation.target.tagName === "DIV") {
        const addedElements = mutation.addedNodes;
        const removedElements = mutation.removedNodes;

        // detect the mutation type of the block or picture (for cards)
        const type = mutation.target.classList.contains("cards-card-image")
          ? "cards-image"
          : mutation.target.attributes["data-aue-model"]?.value;

        switch (type) {
          case "cards":
          case "text-cards":
            // handle card div > li replacements
            if (
              addedElements.length === 1 &&
              addedElements[0].tagName === "UL"
            ) {
              const ulEl = addedElements[0];
              const removedDivEl = [...mutation.removedNodes].filter(
                (node) => node.tagName === "DIV"
              );
              removedDivEl.forEach((div, index) => {
                if (index < ulEl.children.length) {
                  moveInstrumentation(div, ulEl.children[index]);
                }
              });
            }
            break;
          case "cards-image":
            // handle card-image picture replacements
            if (mutation.target.classList.contains("cards-card-image")) {
              const addedPictureEl = [...mutation.addedNodes].filter(
                (node) => node.tagName === "PICTURE"
              );
              const removedPictureEl = [...mutation.removedNodes].filter(
                (node) => node.tagName === "PICTURE"
              );
              if (
                addedPictureEl.length === 1 &&
                removedPictureEl.length === 1
              ) {
                const oldImgEL = removedPictureEl[0].querySelector("img");
                const newImgEl = addedPictureEl[0].querySelector("img");
                if (oldImgEL && newImgEl) {
                  moveInstrumentation(oldImgEL, newImgEl);
                }
              }
            }
            break;
          case "accordion":
            if (
              addedElements.length === 1 &&
              addedElements[0].tagName === "DETAILS"
            ) {
              moveInstrumentation(removedElements[0], addedElements[0]);
              moveInstrumentation(
                removedElements[0].querySelector("div"),
                addedElements[0].querySelector("summary")
              );
            }
            break;
          case "carousel":
            if (
              removedElements.length === 1 &&
              removedElements[0].attributes["data-aue-model"]?.value ===
                "carousel-item"
            ) {
              const resourceAttr =
                removedElements[0].getAttribute("data-aue-resource");
              if (resourceAttr) {
                const itemMatch = resourceAttr.match(/item-(\d+)/);
                if (itemMatch && itemMatch[1]) {
                  const slideIndex = parseInt(itemMatch[1], 10);
                  const slides =
                    mutation.target.querySelectorAll("li.carousel-slide");
                  const targetSlide = Array.from(slides).find(
                    (slide) =>
                      parseInt(slide.getAttribute("data-slide-index"), 10) ===
                      slideIndex
                  );
                  if (targetSlide) {
                    moveInstrumentation(removedElements[0], targetSlide);
                  }
                }
              }
            }
            break;
          case "features":
            removedElements.forEach((removed) => {
              if (
                removed.attributes &&
                removed.attributes["data-aue-model"]?.value === "feature-item"
              ) {
                const resourceAttr = removed.getAttribute("data-aue-resource");
                if (resourceAttr) {
                  const itemMatch = resourceAttr.match(/item-(\d+)/);
                  if (itemMatch && itemMatch[1]) {
                    const slideIndex = parseInt(itemMatch[1], 10);
                    const slides = mutation.target.querySelectorAll("article");
                    const targetSlide = Array.from(slides).find(
                      (slide) =>
                        parseInt(
                          slide.getAttribute("data-feature-index"),
                          10
                        ) === slideIndex
                    );
                    if (targetSlide) {
                      moveInstrumentation(removed, targetSlide);
                      moveInstrumentation(
                        removed.querySelector("div:nth-child(1)"),
                        targetSlide.querySelector("div.feature-number")
                      );
                      moveInstrumentation(
                        removed.querySelector("div:nth-child(2)"),
                        targetSlide.querySelector("h3.feature-title")
                      );
                      moveInstrumentation(
                        removed.querySelector("div:nth-child(3)"),
                        targetSlide.querySelector("div.feature-description")
                      );
                    }
                  }
                }
              }
            });
            break;
          case "technologies":
            // Handle technologies block transformations
            if (addedElements.length > 0) {
              const inner = mutation.target.querySelector(
                ".technologies-inner"
              );
              if (inner) {
                // Move block-level instrumentation to the inner container
                const blockInstrumentation = [...mutation.removedNodes].find(
                  (node) =>
                    node.tagName === "DIV" &&
                    node.attributes["data-aue-model"]?.value === "technologies"
                );
                if (blockInstrumentation) {
                  const leftSection = inner.querySelector(".technologies-left");
                  if (leftSection) {
                    // Move block-level fields to left section elements
                    const oldEyebrow = blockInstrumentation.querySelector(
                      "div:nth-child(1)>div:nth-child(1)>h4:nth-child(1)"
                    );
                    const newEyebrow = leftSection.querySelector(
                      ".technologies-eyebrow"
                    );
                    if (oldEyebrow && newEyebrow) {
                      moveInstrumentation(oldEyebrow, newEyebrow);
                    }

                    const oldHeading = blockInstrumentation.querySelector(
                      "div:nth-child(1)>div:nth-child(1)>h2:nth-child(2)"
                    );
                    const newHeading = leftSection.querySelector(
                      ".technologies-heading"
                    );
                    if (oldHeading && newHeading) {
                      moveInstrumentation(oldHeading, newHeading);
                    }

                    const oldDescription = blockInstrumentation.querySelector(
                      "div:nth-child(1)>div:nth-child(1)>p:nth-child(3)"
                    );
                    const newDescription = leftSection.querySelector(
                      ".technologies-description"
                    );
                    if (oldDescription && newDescription) {
                      moveInstrumentation(oldDescription, newDescription);
                    }
                  }
                }
              }
            }

            // Handle technology-item transformations
            removedElements.forEach((removed) => {
              if (
                removed.attributes &&
                removed.attributes["data-aue-model"]?.value ===
                  "technology-item"
              ) {
                const resourceAttr = removed.getAttribute("data-aue-resource");
                if (resourceAttr) {
                  const itemMatch = resourceAttr.match(/item-(\d+)/);
                  if (itemMatch && itemMatch[1]) {
                    const itemIndex = parseInt(itemMatch[1], 10);
                    const cards = mutation.target.querySelectorAll(
                      "a.technologies-card"
                    );
                    const targetCard = cards[itemIndex];

                    if (targetCard) {
                      moveInstrumentation(removed, targetCard);

                      // Move image instrumentation
                      const oldImg = removed.querySelector(
                        "div:nth-child(1)>picture:nth-child(1)>img"
                      );
                      const newImg = targetCard.querySelector(
                        ".technologies-card-image img"
                      );
                      if (oldImg && newImg) {
                        moveInstrumentation(oldImg, newImg);
                      }

                      // Move title line 1 instrumentation
                      const oldTitleLine1 = removed.querySelector(
                        "div:nth-child(2)>h3:nth-child(1)"
                      );
                      const newTitleLine1 = targetCard.querySelector(
                        ".technologies-card-title-line1"
                      );
                      if (oldTitleLine1 && newTitleLine1) {
                        moveInstrumentation(oldTitleLine1, newTitleLine1);
                      }

                      // Move title line 2 instrumentation
                      const oldTitleLine2 = removed.querySelector(
                        "div:nth-child(2)>h4:nth-child(2)"
                      );
                      const newTitleLine2 = targetCard.querySelector(
                        ".technologies-card-title-line2"
                      );
                      if (oldTitleLine2 && newTitleLine2) {
                        moveInstrumentation(oldTitleLine2, newTitleLine2);
                      }

                      // Move description instrumentation
                      const oldDesc = removed.querySelector(
                        "div:nth-child(2)>p:nth-child(3)"
                      );
                      const newDesc = targetCard.querySelector(
                        ".technologies-card-description"
                      );
                      if (oldDesc && newDesc) {
                        moveInstrumentation(oldDesc, newDesc);
                      }

                      // Move link instrumentation to the card anchor itself
                      const oldLink = removed.querySelector(
                        "div:nth-child(2)>p:nth-child(4)>a:nth-child(1)"
                      );
                      if (oldLink) {
                        moveInstrumentation(oldLink, targetCard);
                      }
                    }
                  }
                }
              }
            });
            break;
          default:
            break;
        }
      }
    });
  });

  mutatingBlocks.forEach((cardsBlock) => {
    observer.observe(cardsBlock, { childList: true, subtree: true });
  });
};

const setupUEEventHandlers = () => {
  // For each img source change, update the srcsets of the parent picture sources
  document.addEventListener("aue:content-patch", (event) => {
    if (event.detail.patch.name.match(/img.*\[src\]/)) {
      const newImgSrc = event.detail.patch.value;
      const picture = event.srcElement.querySelector("picture");

      if (picture) {
        picture.querySelectorAll("source").forEach((source) => {
          source.setAttribute("srcset", newImgSrc);
        });
      }
    }
  });

  document.addEventListener("aue:ui-select", (event) => {
    const { detail } = event;
    const resource = detail?.resource;

    if (resource) {
      const element = document.querySelector(
        `[data-aue-resource="${resource}"]`
      );
      if (!element) {
        return;
      }
      const blockEl =
        element.parentElement?.closest(".block[data-aue-resource]") ||
        element?.closest(".block[data-aue-resource]");
      if (blockEl) {
        const block = blockEl.getAttribute("data-aue-model");
        const index = element.getAttribute("data-slide-index");

        switch (block) {
          case "accordion":
            blockEl.querySelectorAll("details").forEach((details) => {
              details.open = false;
            });
            element.open = true;
            break;
          case "carousel":
            if (index) {
              showSlide(blockEl, index);
            }
            break;
          case "tabs":
            if (element === block) {
              return;
            }
            blockEl.querySelectorAll("[role=tabpanel]").forEach((panel) => {
              panel.setAttribute("aria-hidden", true);
            });
            element.setAttribute("aria-hidden", false);
            blockEl
              .querySelector(".tabs-list")
              .querySelectorAll("button")
              .forEach((btn) => {
                btn.setAttribute("aria-selected", false);
              });
            blockEl
              .querySelector(`[aria-controls=${element?.id}]`)
              .setAttribute("aria-selected", true);
            break;
          default:
            break;
        }
      }
    }
  });
};

export default () => {
  setupObservers();
  setupUEEventHandlers();
};
