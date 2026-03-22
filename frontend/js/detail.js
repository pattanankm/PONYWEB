import { getPonies, getReviews, addReview } from "./api.js";

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

const nameToId = {
  'celestia': 'Princess Celestia',
  'luna': 'Princess Luna',
  'applejack': 'Applejack',
  'fluttershy': 'Fluttershy',
  'rarity': 'Rarity',
  'pinkie': 'Pinkie Pie',
  'twilight': 'Twilight Sparkle',
  'rainbow': 'Rainbow Dash',
  'wensley': 'Wensley',
  'cadance': 'Princess Cadance'
};

let currentPonyId = null;
let cart = JSON.parse(localStorage.getItem('cart') || '[]');

const params = new URLSearchParams(window.location.search);
const ponyKey = params.get('pony') || 'celestia';
const ponyName = nameToId[ponyKey];

async function init() {
  const ponies = await getPonies();
  const pony = ponies.find(p => p.name === ponyName);
  if (!pony) return;

  currentPonyId = pony.pony_id;

  // ดึงค่า Type จากตารางที่ Join มา (pony.type.type_name) 
  // หรือถ้า backend ส่งแบนๆ มาจะเป็น pony.type_name
  const displayType = pony.pony_type?.type_name || pony.type_name || 'Unknown';
  const displayRarity = pony.rarity || 'A';

  document.getElementById('ponyName').textContent = pony.name;
  document.getElementById('ponyPrice').textContent = Number(pony.price).toLocaleString();
  document.getElementById('ponyImage').src = ponyImages[pony.name] || '';
  document.getElementById('ponyDetailsText').textContent = `Type: ${displayType} | Rarity: ${displayRarity}`;

  // Add to cart button
  const cartBtn = document.querySelector('.btn-primary');
  if (cartBtn) {
    cartBtn.onclick = () => {
      cart.push({ pony_id: pony.pony_id, name: pony.name, price: pony.price, qty: 1 });
      localStorage.setItem('cart', JSON.stringify(cart));
      alert(pony.name + ' added to cart!');
    };
  }

  loadReviews(currentPonyId);
}

async function loadReviews(pony_id) {
  const reviews = await getReviews(pony_id);
  const grid = document.getElementById('reviewsGrid');

  if (!reviews || !reviews.length) {
    grid.innerHTML = '<p style="color:#9ca3af;">No reviews yet.</p>';
    return;
  }

  grid.innerHTML = reviews.map(r => `
    <div class="review-card">
      <div class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
      <div class="review-text">${r.comment || ''}</div> 
      <div class="review-author">
        <div class="review-avatar">${(r.username || 'U')[0].toUpperCase()}</div>
        <div class="review-name">${r.username || 'User'}</div>
      </div>
    </div>
  `).join('');
}

async function submitReview() {
  const user = JSON.parse(localStorage.getItem('customer') || '{}');
  if (!user.customer_id) { 
    alert('Please login first'); 
    return; 
  }
  if (!currentPonyId) return;

  const rating = Number(document.getElementById('ratingInput').value);
  const commentInput = document.getElementById('commentInput');
  const comment = commentInput.value.trim();

  try {
    const data = await addReview(user.customer_id, currentPonyId, rating, comment);
    
    if (data && (data.message || data.review_id)) {
      alert('Review submitted! 🌟');
      commentInput.value = ''; // เคลียร์ช่องพิมพ์
      loadReviews(currentPonyId);
    } else {
      alert('Error: ' + (data.message || 'Failed to submit'));
    }
  } catch (error) {
    console.error(error);
    alert('An error occurred while submitting.');
  }
}

// Details toggle
const detailsToggle = document.getElementById('detailsToggle');
if (detailsToggle) {
  detailsToggle.addEventListener('click', () => {
    const content = document.getElementById('detailsContent');
    detailsToggle.classList.toggle('collapsed');
    content.style.display = content.style.display === 'none' ? 'block' : 'none';
  });
}

window.submitReview = submitReview;
init();