import { addOrder } from './api.js';
import './navbar.js';

const ponyInfo = {
  'Princess Celestia': { type: 'Alicorn', rarity: 'A' },
  'Princess Luna': { type: 'Alicorn', rarity: 'A' },
  'Applejack': { type: 'Earth Pony', rarity: 'B' },
  'Fluttershy': { type: 'Pegasus', rarity: 'B' },
  'Rarity': { type: 'Unicorn', rarity: 'B' },
  'Pinkie Pie': { type: 'Earth Pony', rarity: 'B' },
  'Twilight Sparkle': { type: 'Alicorn', rarity: 'A' },
  'Rainbow Dash': { type: 'Pegasus', rarity: 'B' },
  'Wensley': { type: 'Earth Pony', rarity: 'C' },
  'Princess Cadance': { type: 'Alicorn', rarity: 'A' }
};

const ponyImages = {
  'Princess Celestia': 'images/ponyceles.png',
  'Princess Luna': 'images/ponyluna.png',
  'Applejack': 'images/ponyapplejack.png',
  'Fluttershy': 'images/ponyflutter.jpg',
  'Rarity': 'images/ponyrarity.png',
  'Pinkie Pie': 'images/ponypinkypie.png',
  'Twilight Sparkle': 'images/ponytwi.webp',
  'Rainbow Dash': 'images/ponyRainbowDash.png',
  'Wensley': 'images/ponyWensley.webp',
  'Princess Cadance': 'images/ponycadence.webp'
};

const cart = JSON.parse(localStorage.getItem('cart') || '[]');
const orderSummary = document.getElementById('order-summary');
const totalPrice = document.getElementById('total-price');
const headerTotal = document.getElementById('header-total');
const form = document.getElementById('checkout-form');
const checkoutContainer = document.querySelector('.checkout-container');

function renderSummary() {
  if (!cart.length) {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'empty-cart';
    emptyDiv.innerHTML = 'Your cart is empty. <a href="shop.html">Go back to shop</a>.';
    checkoutContainer.innerHTML = '';
    checkoutContainer.appendChild(emptyDiv);
    return;
  }

  let total = 0;
  orderSummary.innerHTML = '';

  cart.forEach(item => {
    const info = ponyInfo[item.name] || { type: 'Unknown', rarity: 'C' };
    const itemDiv = document.createElement('div');
    itemDiv.className = 'order-item';
    itemDiv.innerHTML = `
      <img src="${ponyImages[item.name] || 'https://placehold.co/80x80/fce7f3/c084fc?text=🐴'}" alt="${item.name}"
        class="order-item-image" onerror="this.src='https://placehold.co/80x80/fce7f3/c084fc?text=🐴'" />
      <div class="order-item-info">
        <div class="order-item-name">${item.name}</div>
        <div class="order-item-type">Pony Type : ${info.type}</div>
        <div class="order-item-rarity">Rarity : ${info.rarity}</div>
        <div class="order-item-price">${Number(item.price).toLocaleString()} B</div>
      </div>
    `;
    orderSummary.appendChild(itemDiv);
    total += Number(item.price);
  });

  totalPrice.innerText = total.toLocaleString();
  headerTotal.innerText = total.toLocaleString();
}

if (form && cart.length > 0) {
  form.addEventListener('submit', async event => {
    event.preventDefault();

    const user = JSON.parse(localStorage.getItem('customer') || '{}');
    const total = Number(totalPrice.textContent.replace(/,/g, ''));

    try {
      const data = await addOrder(user.customer_id || null, total, cart);

      if (data.order_id) {
        localStorage.setItem('cart', JSON.stringify([]));
        alert('Order placed! ID: ' + data.order_id);
        window.location.href = 'index.html';
      } else {
        alert('Error: ' + (data.message || 'Order failed'));
      }
    } catch (err) {
      alert('Error: Could not connect to server');
      console.error(err);
    }
  });
}

renderSummary();