const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
let cart = JSON.parse(localStorage.getItem('cart') || '[]');

const wishlistList = document.getElementById('wishlist-list');
const totalPriceEl = document.getElementById('wishlist-total');
const emptyState = document.getElementById('wishlist-empty');

function renderWishlist() {
  if (!wishlist.length) {
    emptyState.style.display = 'block';
    wishlistList.innerHTML = '';
    totalPriceEl.textContent = '0';
    return;
  }

  emptyState.style.display = 'none';
  wishlistList.innerHTML = '';

  let total = 0;

  wishlist.forEach((item, index) => {
    const row = document.createElement('div');
    row.className = 'wishlist-item';
    row.innerHTML = `
      <div class="item-left">
        <div class="item-name">${item.name}</div>
        <div class="item-price">${Number(item.price).toLocaleString()} ฿</div>
      </div>
      <div class="item-actions">
        <button class="small-btn add-to-cart">Add to cart</button>
        <button class="small-btn remove-wish">Remove</button>
      </div>
    `;

    row.querySelector('.add-to-cart').addEventListener('click', () => {
      cart.push({ pony_id: item.pony_id, name: item.name, price: item.price, qty: 1 });
      localStorage.setItem('cart', JSON.stringify(cart));
      alert(item.name + ' added to cart');
    });

    row.querySelector('.remove-wish').addEventListener('click', () => {
      wishlist.splice(index, 1);
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      renderWishlist();
    });

    wishlistList.appendChild(row);
    total += Number(item.price);
  });

  totalPriceEl.textContent = total.toLocaleString();
}

renderWishlist();

