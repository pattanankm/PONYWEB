let cart = JSON.parse(localStorage.getItem("cart")) || [];

const list      = document.getElementById("cart-list");
const totalEl   = document.getElementById("total-price");
const subtotalEl = document.getElementById("subtotal");
const emptyMsg  = document.getElementById("cart-empty");

/* ── Group duplicate items into { name, price, quantity } ── */
function groupCart() {
  const grouped = {};
  cart.forEach(item => {
    if (grouped[item.name]) {
      grouped[item.name].quantity++;
    } else {
      grouped[item.name] = { name: item.name, price: item.price, quantity: 1 };
    }
  });
  return Object.values(grouped);
}

/* ── Render ─────────────────────────────────────────────── */
function renderCart() {
  list.innerHTML = "";
  let total = 0;

  const groupedCart = groupCart();

  /* Show / hide empty state */
  if (groupedCart.length === 0) {
    emptyMsg.style.display = "block";
  } else {
    emptyMsg.style.display = "none";
  }

  groupedCart.forEach(item => {
    const totalItemPrice = Number(item.price) * item.quantity;

    const div = document.createElement("div");
    div.className = "cart-item";

    /* Item info (name + price per line) */
    const itemInfo = document.createElement("div");
    itemInfo.className = "item-info";
    itemInfo.innerHTML = `
      <div class="item-name">${item.name}</div>
      <div class="item-price">${Number(item.price).toLocaleString()} ฿ / ชิ้น</div>
    `;

    /* Total price for this line */
    const priceSpan = document.createElement("span");
    priceSpan.className = "price";
    priceSpan.style.fontWeight = "700";
    priceSpan.style.minWidth = "80px";
    priceSpan.style.textAlign = "right";
    priceSpan.innerText = `${totalItemPrice.toLocaleString()} ฿`;

    /* Quantity control */
    const quantityControl = document.createElement("div");
    quantityControl.className = "quantity-control";
    quantityControl.innerHTML = `
      <button onclick="decreaseQty('${item.name}')">−</button>
      <span>${item.quantity}</span>
      <button onclick="increaseQty('${item.name}')">+</button>
    `;

    /* Remove button */
    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.innerText = "🗑 Remove";
    removeBtn.onclick = () => removeItem(item.name);

    div.appendChild(itemInfo);
    div.appendChild(quantityControl);
    div.appendChild(priceSpan);
    div.appendChild(removeBtn);
    list.appendChild(div);

    total += totalItemPrice;
  });

  /* Update summary */
  const formatted = total.toLocaleString() + " ฿";
  if (subtotalEl) subtotalEl.innerText = formatted;
  totalEl.innerText = formatted;
}

/* ── Actions ─────────────────────────────────────────────── */
function removeItem(itemName) {
  cart = cart.filter(item => item.name !== itemName);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

function increaseQty(itemName) {
  const ref = cart.find(i => i.name === itemName);
  if (ref) {
    cart.push({ name: itemName, price: ref.price });
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
  }
}

function decreaseQty(itemName) {
  const index = cart.findIndex(item => item.name === itemName);
  if (index > -1) {
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
  }
}

function goCheckout() {
  if (cart.length === 0) {
    alert("ตะกร้าของคุณยังว่างอยู่ค่ะ 🛒");
    return;
  }
  window.location.href = "checkout.html";
}

/* ── Init ────────────────────────────────────────────────── */
renderCart();