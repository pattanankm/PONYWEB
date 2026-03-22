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
  try {
    const response = await getPonies();
    
    // Ensure response is an array
    if (!Array.isArray(response)) {
      console.error('Invalid response from API:', response);
      document.getElementById('ponyDetailsText').textContent = 'Error loading pony details. Backend may not be running.';
      return;
    }
    
    const ponies = response;
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

    // Add to cart button - select the button inside cart-action
    const cartBtn = document.querySelector('.cart-action .btn-primary');
    if (cartBtn) {
      cartBtn.onclick = (e) => {
        e.preventDefault();
        cart.push({ pony_id: pony.pony_id, name: pony.name, price: pony.price, qty: 1 });
        localStorage.setItem('cart', JSON.stringify(cart));
        alert(pony.name + ' added to cart!');
        setTimeout(() => window.location.href = 'cart.html', 500);
      };
    } else {
      console.error('Cart button not found');
    }

    loadReviews(currentPonyId);
  } catch (error) {
    console.error('Error initializing pony details:', error);
    document.getElementById('ponyDetailsText').textContent = 'Error loading pony details. Please try again.';
  }
}

async function loadReviews(pony_id) {
  try {
    let reviews = await getReviews(pony_id);
    const grid = document.getElementById('reviewsGrid');

    if (!grid) {
      console.error('reviewsGrid element not found');
      return;
    }

    // Handle API response format - might be wrapped in 'value'
    if (reviews && reviews.value) {
      reviews = reviews.value;
    }
    
    // If reviews is not an array, make it an array
    if (!Array.isArray(reviews)) {
      reviews = [];
    }

    console.log('Reviews loaded:', reviews, 'Count:', reviews.length);

    if (reviews.length === 0) {
      grid.innerHTML = '<p style="color:#9ca3af; text-align:center; padding:2rem;">No reviews yet. Be the first to review! ⭐</p>';
      return;
    }

    grid.innerHTML = reviews.map(r => `
      <div class="review-card">
        <div class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
        <div class="review-text">${r.comment || 'No comment'}</div> 
        <div class="review-author">
          <div class="review-avatar">${(r.username || 'U')[0].toUpperCase()}</div>
          <div class="review-name">${r.username || 'Anonymous'}</div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading reviews:', error);
    const grid = document.getElementById('reviewsGrid');
    if (grid) {
      grid.innerHTML = '<p style="color:#dc2626;">Error loading reviews. Please try again.</p>';
    }
  }
}

async function submitReview() {
  const user = JSON.parse(localStorage.getItem('customer') || '{}');
  if (!user.customer_id) { 
    alert('Please login first'); 
    return; 
  }
  if (!currentPonyId) {
    alert('Pony details not loaded');
    return;
  }

  const rating = Number(document.getElementById('ratingInput').value);
  const commentInput = document.getElementById('commentInput');
  const comment = commentInput.value.trim();

  if (!comment) {
    alert('Please write a comment');
    return;
  }

  try {
    const data = await addReview(user.customer_id, currentPonyId, rating, comment);
    
    if (data && data.message) {
      alert('✓ Review submitted successfully! 🌟');
      commentInput.value = ''; // เคลียร์ช่องพิมพ์
      document.getElementById('ratingInput').value = '5'; // Reset rating
      
      // Reload reviews after a short delay to ensure data is saved
      setTimeout(() => {
        loadReviews(currentPonyId);
      }, 500);
    } else {
      alert('Error: ' + (data.message || 'Failed to submit review'));
    }
  } catch (error) {
    console.error('Error submitting review:', error);
    alert('Error: ' + error.message);
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