

import { products } from '../data/products.js';
import { addtocart, updateCartQuantity, addedmessage } from './cart.js';

function renderProducts(list) {
  let html = '';

  list.forEach((p) => {
    html += `
      <div class="product-container">
        <div class="product-image-container">
          <img class="product-image" src="${p.image}">
        </div>

        <div class="product-name limit-text-to-2-lines">${p.name}</div>

        <div class="product-rating-container">
          <img class="product-rating-stars"
               src="images/ratings/rating-${p.rating.stars * 10}.png">
          <div class="product-rating-count link-primary">${p.rating.count}</div>
        </div>

        <div class="product-price">Rs. ${p.priceCents}</div>

        <div class="product-quantity-container">
          <select class="js-qty-${p.id}">
            ${Array.from({ length: 10 }, (_, i) =>
              `<option value="${i + 1}" ${i ? '' : 'selected'}>${i + 1}</option>`
            ).join('')}
          </select>
        </div>

        <div class="product-spacer"></div>

        <div class="added-to-cart js-add-to-cart${p.id}">
          <img src="images/icons/checkmark.png"> Added
        </div>

        <button class="add-to-cart-button button-primary js-add-btn"
                data-id="${p.id}">
          Add to Cart
        </button>
      </div>`;
  });

  const grid = document.querySelector('.js-products-grid');
  grid.innerHTML = html;

  grid.querySelectorAll('.js-add-btn').forEach(btn => {
    btn.onclick = () => {
      const id  = btn.dataset.id;
      const qty = Number(grid.querySelector(`.js-qty-${id}`).value);
      addtocart(id, qty);
      updateCartQuantity();
      addedmessage(id); // ✅ show message
    };
  });
}

/* initial load + search */
renderProducts(products);
updateCartQuantity();

const search = document.querySelector('.search-bar');
if (search) {
  search.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase();
    renderProducts(products.filter(p => p.name.toLowerCase().includes(q)));
  });
}
