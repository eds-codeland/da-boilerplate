# Technologies Component - Universal Editor Integration Guide

## Problem Analysis

The Technologies component had a mismatch between its Universal Editor (UE) structure and the final rendered DOM structure:

1. **UE Structure**: Simple table-like structure with rows and cells
2. **Rendered Structure**: Complex nested div structure with classes for styling
3. **Issue**: UE instrumentation attributes (`data-aue-*`) were lost during DOM transformation

## Solution Overview

The solution implements a three-part approach:

### 1. **Preserve UE Attributes During Decoration** (`technologies.js`)
   - Store references to original DOM elements that have UE attributes
   - Copy UE attributes to newly created DOM elements
   - Maintain the connection between UE's data model and the visual components

### 2. **Handle DOM Mutations** (`ue.js`)
   - Observe changes to the technologies block
   - Transfer instrumentation when UE updates content
   - Map old structure to new structure using element selectors

### 3. **Define Content Model** (`technologies.json`)
   - Block-level fields (eyebrow, heading, description) → edited at section level
   - Item-level fields (image, titles, description, link) → edited per card

## File Changes

### 1. `/blocks/technologies/technologies.js`

#### Added UE Attribute Copy Function
```javascript
function copyUEAttributes(source, target) {
  if (!source || !target) return;
  
  const ueAttributes = ['data-aue-resource', 'data-aue-type', 'data-aue-label', 'data-aue-model', 'data-aue-filter'];
  ueAttributes.forEach(attr => {
    const value = source.getAttribute(attr);
    if (value) {
      target.setAttribute(attr, value);
    }
  });
}
```

#### Stored Original UE Elements
- Captured references to elements with UE attributes before transformation
- Stored them alongside card data for later transfer

#### Applied UE Attributes to New Elements
- **Left Section**: Eyebrow, heading, description get UE attributes from original h4, h2, p elements
- **Cards**: Each card and its child elements receive UE attributes from original row structure
- **Card Elements**: Image, title lines, description, link all preserve their editability

### 2. `/ue/scripts/ue.js`

Added a new case in the MutationObserver to handle technologies block transformations:

```javascript
case "technologies":
  // Handle block-level transformations
  // Move instrumentation from simple structure to complex rendered structure
  
  // Handle technology-item transformations
  // Map each item's instrumentation to the corresponding card
```

The observer:
- Detects when the block is transformed (initial load or UE updates)
- Moves instrumentation from old elements to new elements
- Maps item indices to card positions
- Transfers all field-level instrumentation

### 3. `/ue/models/blocks/technologies.json`

#### Structure Definition

**Block Component** (`technologies`):
- **Eyebrow**: `h4` in first cell
- **Title**: `h2` in first cell  
- **Description**: `p` in first cell

**Item Component** (`technology-item`):
- **Image**: `img[src]` in first div
- **Image Alt**: `img[alt]` in first div
- **Title Line 1**: `h3` in second div
- **Title Line 2**: `h4` in second div
- **Description**: `p` (rich text) in second div
- **Link URL**: `a[href]` in second div

## How It Works

### Content Structure in Universal Editor

```
Technologies Block (technologies)
├─ Row 1 (block-level content)
│  └─ Cell 1
│     ├─ h4 (Eyebrow) ← Editable at block level
│     ├─ h2 (Heading) ← Editable at block level
│     └─ p (Description) ← Editable at block level
├─ Row 2 (technology-item #1)
│  ├─ Cell 1: Image
│  └─ Cell 2: Title (h3+h4), Description (p), Link (a)
├─ Row 3 (technology-item #2)
│  ├─ Cell 1: Image
│  └─ Cell 2: Title (h3+h4), Description (p), Link (a)
└─ ... more items
```

### Rendered DOM Structure

```
div.technologies
└─ div.technologies-inner
   ├─ div.technologies-left (← block fields)
   │  ├─ div.technologies-eyebrow ← UE editable
   │  ├─ h2.technologies-heading ← UE editable
   │  └─ div.technologies-description ← UE editable
   └─ div.technologies-right
      └─ div.technologies-cards
         ├─ a.technologies-card ← UE editable (item #1)
         │  ├─ div.technologies-card-image
         │  │  └─ img ← UE editable
         │  ├─ div.technologies-card-overlay
         │  └─ div.technologies-card-content
         │     ├─ div.technologies-card-title
         │     │  ├─ span.line1 ← UE editable
         │     │  └─ span.line2 ← UE editable
         │     ├─ div.technologies-card-description ← UE editable
         │     └─ div.technologies-card-arrow
         └─ a.technologies-card (item #2)
            └─ ... same structure
```

## Universal Editor Behavior

### Editing Block-Level Content
1. Click on eyebrow/heading/description in left section
2. Universal Editor shows fields from the `technologies` model
3. Changes update only the left section content
4. All cards remain unchanged

### Editing Individual Cards
1. Click on any card element (image, title, description)
2. Universal Editor shows fields from the `technology-item` model
3. Changes update only that specific card
4. Other cards and block-level content remain unchanged

### Adding/Removing Cards
1. In Universal Editor, add/remove `technology-item` components
2. The mutation observer detects changes
3. Instrumentation is automatically transferred to new cards
4. Block decoration re-applies the visual structure

## Testing the Integration

1. **Open page in Universal Editor**
2. **Test block-level editing**:
   - Click eyebrow → should open editor with "Eyebrow" field
   - Click heading → should open editor with "Title" field
   - Click description → should open editor with "Description" field
3. **Test card editing**:
   - Click card image → should open editor with "Image" and "Image Alt Text" fields
   - Click card title → should open editor with "Title Line 1" and "Title Line 2" fields
   - Click card description → should open editor with "Description" field
   - Edit link URL → should update the card's href
4. **Test adding/removing**:
   - Add new technology-item → should render as new card
   - Remove technology-item → should remove corresponding card

## Key Concepts

### UE Instrumentation Attributes
- `data-aue-resource`: Unique identifier for the content item
- `data-aue-model`: References the model definition (technologies or technology-item)
- `data-aue-type`: Specifies the content type
- `data-aue-label`: Human-readable label
- `data-aue-filter`: Defines what components can be added

### Mutation Observer Pattern
- Watches for DOM changes during block decoration
- Transfers instrumentation from old to new elements
- Ensures UE can still edit content after transformation

### Selector Mapping
- UE uses CSS selectors to target specific fields
- Selectors must match the structure in the initial table format
- The decorator and mutation handler translate these to the final structure

## Benefits

✅ **Block-level content** is editable without affecting cards
✅ **Each card** is independently editable
✅ **Add/remove cards** works seamlessly
✅ **Visual structure** remains unchanged for users
✅ **UE experience** is intuitive and consistent

## Maintenance Notes

If you need to:
- **Add new block-level fields**: Update both `technologies.json` model and the left section rendering in `technologies.js`
- **Add new card fields**: Update `technology-item` model in `technologies.json` and card rendering in `technologies.js`
- **Change DOM structure**: Update the selector mapping in `ue.js` mutation handler
- **Debug UE issues**: Check browser console for `data-aue-*` attributes on rendered elements

