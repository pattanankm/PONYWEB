// Map pony names to URL parameters
const nameToId = {
  'Princess Celestia': 'celestia',
  'Princess Luna': 'luna',
  'Applejack': 'applejack',
  'Fluttershy': 'fluttershy',
  'Rarity': 'rarity',
  'Pinkie Pie': 'pinkie',
  'Twilight Sparkle': 'twilight',
  'Rainbow Dash': 'rainbow'
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
  'Rainbow Dash': { type: 'Pegasus', rarity: 'B' }
};

const rarityClass = { A: 'rarity-a', B: 'rarity-b', C: 'rarity-c' };

async function loadPonies(){
  const ponies = await getPonies();
  const list = document.getElementById("pony-list");

  ponies.forEach(p => {
    const card = document.createElement("div");
    card.className = 'pony-card';
    
    const info = ponyInfo[p.name] || { type: 'Unknown', rarity: 'C' };
    const ponyId = nameToId[p.name] || 'unknown';
    
    card.innerHTML = `
      <div class="pony-img-wrap">
        <img src="images/${p.img}" alt="${p.name}"
             onerror="this.src='https://placehold.co/200x180/fce7f3/c084fc?text=🐴'"/>
        <span class="pony-rarity ${rarityClass[info.rarity]}">${info.rarity}</span>
        <button class="wishlist-btn" title="Wishlist">🤍</button>
      </div>
      <div class="pony-info">
        <h4>${p.name}</h4>
        <p class="pony-type">${info.type}</p>
        <div class="pony-bottom">
          <span class="pony-price">${p.price.toLocaleString()} ฿</span>
          <button class="cart-btn" title="Add to cart">🛒</button>
        </div>
      </div>
    `;
    
    // Make card clickable to go to detail page
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.wishlist-btn') && !e.target.closest('.cart-btn')) {
        window.location.href = `detail.html?pony=${ponyId}`;
      }
    });
    
    list.appendChild(card);
  });
}

loadPonies();