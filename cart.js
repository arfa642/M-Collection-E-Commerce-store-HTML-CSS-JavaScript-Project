export let cart = JSON.parse(localStorage.getItem('cart')) || [];

export function addtocart(productId, qty) {
  const item = cart.find(i => i.productId === productId);
  item ? (item.quantity += qty) : cart.push({ productId, quantity: qty });
  saveToStorage();
}

export function removeFromCart(id) {
  cart = cart.filter(i => i.productId !== id);
  saveToStorage();
}

export function setCartItemQuantity(id, qty) {
  const item = cart.find(i => i.productId === id);
  if (item) {
    item.quantity = qty;
    saveToStorage();
  }
}

export function saveToStorage() {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartQuantity();
}

export function updateCartQuantity() {
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('.js-cart-quantity, .js-checkout')
    .forEach(el => el && (el.textContent = total || ''));
}

export function addedmessage(productId) {
  const msg = document.querySelector(`.js-add-to-cart${productId}`);
  if (!msg) return;

  msg.classList.add('visible');
  setTimeout(() => {
    msg.classList.remove('visible');
  }, 2000);
}
