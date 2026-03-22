import { getWishlist, removeFromWishlist } from "./api.js";

async function loadWishlist() {
  const user = JSON.parse(localStorage.getItem('customer') || '{}');
  const wishlistList = document.getElementById('wishlist-list');
  const wishlistEmpty = document.getElementById('wishlist-empty');
  const wishlistTotal = document.getElementById('wishlist-total');

  // 1. ตรวจสอบว่า Login หรือยัง
  if (!user.customer_id) {
    wishlistEmpty.innerHTML = 'Please <a href="login.html">Login</a> to see your wishlist.';
    return;
  }

  try {
    // 2. ดึงข้อมูลจาก API
    const res = await getWishlist(user.customer_id);
    
    // กันเหนียว: เช็คว่าเป็น Array ไหม
    const items = Array.isArray(res) ? res : [];

    if (items.length === 0) {
      wishlistEmpty.style.display = 'block';
      wishlistList.innerHTML = '';
      wishlistTotal.textContent = '0';
      return;
    }

    // 3. ถ้ามีข้อมูล ให้ซ่อนคำว่า Empty และแสดงรายการ
    wishlistEmpty.style.display = 'none';
    
    let total = 0;
    wishlistList.innerHTML = items.map(item => {
      const price = Number(item.price) || 0;
      total += price;
      
      return `
        <div class="wishlist-item">
          <div class="item-left">
            <span class="item-name">${item.name}</span>
            <span class="item-price">${price.toLocaleString()} ฿</span>
          </div>
          <div class="item-actions">
            <button class="small-btn" onclick="removeItem(${item.wishlist_id})">❌ Remove</button>
          </div>
        </div>
      `;
    }).join('');

    // 4. อัปเดตราคาสูงสุด
    wishlistTotal.textContent = total.toLocaleString();

  } catch (error) {
    console.error('Error loading wishlist:', error);
    wishlistEmpty.textContent = 'Failed to load wishlist. Please try again later.';
  }
}

// 5. ฟังก์ชันสำหรับลบไอเทม (ต้องผูกกับ window เพื่อให้ปุ่มใน HTML เรียกใช้ได้)
window.removeItem = async (wishlist_id) => {
  if (confirm('Do you want to remove this pony from your wishlist?')) {
    try {
      const result = await removeFromWishlist(wishlist_id);
      if (result) {
        alert('Removed successfully! ✨');
        loadWishlist(); // โหลดข้อมูลใหม่ทันที
      }
    } catch (error) {
      alert('Error removing item');
    }
  }
};

// เริ่มทำงานเมื่อโหลดหน้า
loadWishlist();