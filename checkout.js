import {
  cart,
  removeFromCart,
  updateCartQuantity,
  setCartItemQuantity
} from './cart.js';
import { getproduct } from '../data/products.js';
import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';

function renderCartSummary() {
  let html = '';

  cart.forEach(item => {
    const p = getproduct(item.productId);
    if (!p) return;

    html += `
      <div class="cart-item-container js-item-${p.id}">
        <div class="delivery-date">
          Delivery date: ${dayjs().add(7, 'day').format('DD MMM YYYY')}
        </div>

        <div class="cart-item-details-grid">
          <img class="product-image js-main-${p.id}" src="${p.image}">

          <div class="product-item-details">
            <div class="product-name">${p.name}</div>
            <div class="product-price">Rs.${p.priceCents}</div>

            <div class="product-quantity">
              Quantity:
              <span class="quantity-label q-${p.id}">${item.quantity}</span>
              <span class="link-primary js-up" data-id="${p.id}">Update</span>
              <span class="link-primary js-del" data-id="${p.id}">Delete</span>
              <span class="js-ui ui-${p.id}"></span>
            </div>
          </div>

          <div class="variations-div" style="display:grid;grid-template-columns:60px 60px;gap:5px;">
            ${['image','v2','v3','v4'].map(k => `
              <button class="vb" data-img="${p[k]}" data-id="${p.id}" style="border:none;padding:0;">
                <img src="${p[k]}" style="height:50px;width:50px;">
              </button>
            `).join('')}
          </div>
        </div>
      </div>`;
  });

  document.querySelector('.js-order-summary').innerHTML = html;

  document.querySelectorAll('.js-del').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      removeFromCart(id);
      document.querySelector(`.js-item-${id}`)?.remove();
      updateCartQuantity();
      renderPaymentSummary();
    };
  });

  document.querySelectorAll('.js-up').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      const box = document.querySelector(`.ui-${id}`);
      btn.style.display = 'none';
      box.innerHTML = `
        <select class="js-sel-${id}">
          ${Array.from({ length: 10 }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('')}
        </select>
        <span class="link-primary js-save" data-id="${id}">Save</span>`;
      box.querySelector('.js-save').onclick = () => {
        const q = Number(document.querySelector(`.js-sel-${id}`).value);
        document.querySelector(`.q-${id}`).textContent = q;
        setCartItemQuantity(id, q);
        updateCartQuantity();
        renderPaymentSummary();
        box.innerHTML = '';
        btn.style.display = 'inline';
      };
    };
  });

  document.querySelectorAll('.vb').forEach(btn => {
    btn.onclick = () => {
      const main = document.querySelector(`.js-main-${btn.dataset.id}`);
      if (main) main.src = btn.dataset.img;
    };
  });
}

function renderPaymentSummary() {
  let subtotal = 0, shipping = 0;

  cart.forEach(i => {
    const p = getproduct(i.productId);
    if (!p) {
      console.warn('Missing product for cart item:', i.productId);
      return;
    }
    subtotal += p.priceCents * i.quantity;
    shipping += 200 * i.quantity;
  });

  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + shipping + tax;

  document.querySelector('.js-payment-summary').innerHTML = `
    <div class="payment-summary-title">Order Summary</div>
    <div class="payment-summary-row"><div>Subtotal</div><div class="payment-summary-money">Rs.${subtotal}</div></div>
    <div class="payment-summary-row"><div>Shipping &amp; handling</div><div class="payment-summary-money">Rs.${shipping}</div></div>
    <div class="payment-summary-row"><div>Tax (10%)</div><div class="payment-summary-money">Rs.${tax}</div></div>
    <div class="payment-summary-row total-row"><div>Total</div><div class="payment-summary-money">Rs.${total}</div></div>

    <label for="customer-name" style="margin-top:20px;display:block;">Your Name</label>
    <input id="customer-name" placeholder="Name" style="margin-top:10px;padding:10px;width:100%;max-width:300px;border:1px solid #ccc;border-radius:6px;">

    <label for="customer-phone" style="display:block;margin-top:15px;">Phone Number</label>
    <input id="customer-phone" placeholder="Phone" style="padding:10px;width:100%;max-width:300px;border:1px solid #ccc;border-radius:6px;">

    <label for="customer-email" style="display:block;margin-top:15px;">Email Address</label>
    <input id="customer-email" type="email" placeholder="Email" style="padding:10px;width:100%;max-width:300px;border:1px solid #ccc;border-radius:6px;margin-bottom:20px;">

    <button id="place-order" class="place-order-button button-primary" style="margin-top:15px;">Place your order</button>
  `;

  bindPlaceOrder();
}

function handlePlaceOrder() {
  let items = [], subtotal = 0, shipping = 0;

  cart.forEach(i => {
    const p = getproduct(i.productId);
    if (!p) return;
    items.push(`${p.name} × ${i.quantity}`);
    subtotal += p.priceCents * i.quantity;
    shipping += 200 * i.quantity;
  });

  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + shipping + tax;
  const summary = items.join(', ');

  const name = document.getElementById('customer-name')?.value || 'Unknown';
  const phone = document.getElementById('customer-phone')?.value || 'Unknown';
  const email = document.getElementById('customer-email')?.value || 'unknown@example.com';

  // Send email to customer
  emailjs.send('YOUR_SERVICE_ID', 'CUSTOMER_TEMPLATE_ID', {
    to_email: email,
    to_name: name,
    contact_number: phone,
    order_details: summary,
    subtotal, shipping, tax, total
  }).then(() => {
    // Send email to admin
    return emailjs.send('YOUR_SERVICE_ID', 'ADMIN_TEMPLATE_ID', {
      admin_email: 'ADMIN_EMAIL_HERE',
      to_name: name,
      contact_number: phone,
      customer_email: email,
      order_details: summary,
      subtotal, shipping, tax, total
    });
  }).then(() => {
    alert('✅ Order placed! Confirmation e-mails sent.');
    cart.length = 0;
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartQuantity();
    renderCartSummary();
    renderPaymentSummary();
  }).catch(err => {
    console.error('EmailJS error:', err);
    alert('❌ Could not send e-mail.');
  });
}

function bindPlaceOrder() {
  const btn = document.getElementById('place-order');
  if (btn && !btn.dataset.bound) {
    btn.dataset.bound = 'yes';
    btn.addEventListener('click', handlePlaceOrder);
  }
}

// Initial load
renderCartSummary();
renderPaymentSummary();
bindPlaceOrder();
