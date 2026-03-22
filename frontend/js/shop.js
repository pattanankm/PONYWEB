import { getPonies, getWishlist, addToWishlist, removeFromWishlist } from "./api.js";
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

const saveWishlist = () => localStorage.setItem("wishlist", JSON.stringify(wishlist));

// Map pony names to URL parameters
const nameToId = {
  'Princess Celestia': 'celestia',
  'Princess Luna': 'luna',
  'Applejack': 'applejack',
  'Fluttershy': 'fluttershy',
  'Rarity': 'rarity',
  'Pinkie Pie': 'pinkie',
  'Twilight Sparkle': 'twilight',
  'Rainbow Dash': 'rainbow',
  'Wensley': 'wensley',
  'Princess Cadance': 'cadance'
};

// Map pony names to image files
const ponyImages = {
  'Princess Celestia': '/frontend/images/ponyceles.png',
  'Princess Luna': '/frontend/images/ponyluna.png',
  'Applejack': '/frontend/images/ponyapplejack.png',
  'Fluttershy': '/frontend/images/ponyflutter.jpg',
  'Rarity': '/frontend/images/ponyrarity.png',
  'Pinkie Pie': '/frontend/images/ponypinkypie.png',
  'Twilight Sparkle': '/frontend/images/ponytwi.webp',
  'Rainbow Dash': '/frontend/images/ponyRainbowDash.png',
  'Wensley': '/frontend/images/ponyWensley.webp',
  'Princess Cadance': '/frontend/images/ponycadence.webp'
};

// Pony types and rarity info
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

const rarityClass = { A: 'rarity-a', B: 'rarity-b', C: 'rarity-c' };

async function loadPonies(){
  try {
    console.log('Loading ponies from API...');
    const response = await getPonies();
    
    // Ensure it's an array and handle errors
    if (!Array.isArray(response)) {
      console.error('Invalid response from API:', response);
      document.getElementById("pony-list").innerHTML = '<p style="text-align:center; padding: 40px; color: #dc2626;">Error loading ponies: Invalid API response. Make sure the backend is running on port 3000.</p>';
      return;
    }
    
    const ponies = response;
    const user = JSON.parse(localStorage.getItem('customer') || '{}');
    
    // --- แก้ไขจุดนี้ ---
    let wishlistData = [];
    if (user.customer_id) {
        const response = await getWishlist(user.customer_id);
        wishlistData = Array.isArray(response) ? response : [];
    }
    let dbWishlist = wishlistData;
    // -----------------

    console.log('Ponies loaded:', ponies);
    
    if (!ponies || ponies.length === 0) {
      console.warn('No ponies returned from API');
      document.getElementById("pony-list").innerHTML = '<p style="text-align:center; padding: 40px; color: #888;">No ponies available. Check if backend is running on port 3000.</p>';
      return;
    }

    const list = document.getElementById("pony-list");

    ponies.forEach(p => {
      const card = document.createElement("div");
      card.className = 'pony-card';
      
      const info = ponyInfo[p.name] || { type: 'Unknown', rarity: 'C' };
      const ponyId = nameToId[p.name] || 'unknown';
      
      card.innerHTML = `
    <div class="pony-img-wrap">
      <img src="${ponyImages[p.name] || 'https://placehold.co/200x180/fce7f3/c084fc?text=🐴'}"
           alt="${p.name}"
           onerror="this.src='https://placehold.co/200x180/fce7f3/c084fc?text=🐴'"/>
      <span class="pony-rarity ${rarityClass[info.rarity]}">${info.rarity}</span>
      <button class="wishlist-btn" title="Wishlist">🤍</button>
    </div>
    <div class="pony-info">
      <h4>${p.name}</h4>
      <p class="pony-type">${info.type}</p>
      <div class="pony-bottom">
        <span class="pony-price">${Number(p.price).toLocaleString()} ฿</span>
        <button class="cart-btn" title="Add to cart">🛒</button>
      </div>
    </div>
  `;

      const wishlistBtn = card.querySelector('.wishlist-btn');
      const isWishlisted = () => dbWishlist.some(w => w.pony_id === p.pony_id);
      const refreshWishlistButton = () => {
        wishlistBtn.textContent = isWishlisted() ? '❤️' : '🤍';
      };
      refreshWishlistButton();

wishlistBtn.addEventListener('click', async (e) => {
  e.stopPropagation();
  const user = JSON.parse(localStorage.getItem('customer') || '{}');
  if (!user.customer_id) { alert('Please login first'); return; }

  if (isWishlisted()) {
    const found = dbWishlist.find(w => w.pony_id === p.pony_id);
    if (found) await removeFromWishlist(found.wishlist_id);
    dbWishlist = dbWishlist.filter(w => w.pony_id !== p.pony_id);
    alert(`${p.name} removed from wishlist`);
  } else {
    const result = await addToWishlist(user.customer_id, p.pony_id);
    dbWishlist.push({ wishlist_id: result.wishlist_id, pony_id: p.pony_id });
    alert(`${p.name} added to wishlist`);
  }

  refreshWishlistButton();
});

      // Make card clickable to go to detail page
      card.addEventListener('click', (e) => {
        if (!e.target.closest('.wishlist-btn') && !e.target.closest('.cart-btn')) {
          window.location.href = `detail.html?pony=${ponyId}`;
        }
      });

      const cartBtn = card.querySelector(".cart-btn");

      cartBtn.addEventListener("click", (e) => {
        e.stopPropagation();

        cart.push({
          pony_id: p.pony_id,
          name: p.name,
          price: p.price,
          qty: 1
        });

        localStorage.setItem("cart", JSON.stringify(cart));
        alert(p.name + " added to cart!");
      });

      list.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading ponies:', error);
    document.getElementById("pony-list").innerHTML = '<p style="text-align:center; padding: 40px; color: red;">Error loading ponies: ' + error.message + '</p>';
  }

  // หาส่วนที่ push item เข้า cart แล้วเพิ่ม id

}

loadPonies();