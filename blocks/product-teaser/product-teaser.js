import { fetchCommerceGraphQL } from '../../scripts/commerce.js';

export default async function decorate(block) {
  const pageSize = Number(block.dataset.pageSize || 4);

  block.innerHTML = '<div class="product-teaser__loading">Loading products...</div>';

  try {
    const query = `
      query GetProducts($pageSize: Int!) {
        products(pageSize: $pageSize) {
          items {
            id
            sku
            name
            shortDescription
            urlKey
            price {
              final {
                amount {
                  value
                  currency
                }
              }
            }
            images(roles: ["image"]) {
              url
              label
            }
          }
        }
      }
    `;

    const { data } = await fetchCommerceGraphQL(query, { pageSize });
    const products = data?.products?.items || [];

    if (products.length === 0) {
      block.innerHTML = '<div class="product-teaser__empty">No products found</div>';
      return;
    }

    const fragment = document.createRange().createContextualFragment(`
      <div class="product-teaser__grid">
        ${products.map((product) => {
          const imageUrl = product.images?.[0]?.url || '';
          const price = product.price?.final?.amount?.value;
          const currency = product.price?.final?.amount?.currency;

          return `
            <div class="product-teaser__card">
              <a href="/${product.urlKey}.html" class="product-teaser__link">
                <div class="product-teaser__image">
                  ${imageUrl ? `<img src="${imageUrl}" alt="${product.name}" loading="lazy" />` : ''}
                </div>
                <div class="product-teaser__content">
                  <h3 class="product-teaser__name">${product.name}</h3>
                  <p class="product-teaser__description">${product.shortDescription || ''}</p>
                  <div class="product-teaser__price">
                    <span class="product-teaser__price-value">${currency && price != null ? `${currency} ${price}` : ''}</span>
                  </div>
                </div>
              </a>
            </div>
          `;
        }).join('')}
      </div>
    `);

    block.innerHTML = '';
    block.appendChild(fragment);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Product Teaser Error:', error);
    block.innerHTML = `<div class="product-teaser__error">Error loading products: ${error.message}</div>`;
  }
}
