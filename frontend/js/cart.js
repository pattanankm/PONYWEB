let cart = JSON.parse(localStorage.getItem("cart")) || [];

const list = document.getElementById("cart-list");
const totalEl = document.getElementById("total-price");

function groupCart(){
const grouped = {};
cart.forEach(item => {
if(grouped[item.name]){
grouped[item.name].quantity++;
}else{
grouped[item.name] = {name:item.name, price:item.price, quantity:1};
}
});
return Object.values(grouped);
}

function renderCart(){

list.innerHTML = "";

let total = 0;

const groupedCart = groupCart();

groupedCart.forEach((item)=>{

const div = document.createElement("div");
div.className = "cart-item";

const itemInfo = document.createElement("div");
itemInfo.className = "item-info";
itemInfo.innerHTML = `
<span>${item.name} x${item.quantity}</span>
`;

const priceSpan = document.createElement("span");
priceSpan.className = "price";
const totalItemPrice = Number(item.price) * item.quantity;
priceSpan.innerText = `${totalItemPrice.toLocaleString()} ฿`;

const quantityControl = document.createElement("div");
quantityControl.className = "quantity-control";
quantityControl.innerHTML = `
<button onclick="decreaseQty('${item.name}')">−</button>
<span>${item.quantity}</span>
<button onclick="increaseQty('${item.name}')">+</button>
`;

const removeBtn = document.createElement("button");
removeBtn.innerText = "Remove";
removeBtn.onclick = () => removeItem(item.name);

itemInfo.appendChild(priceSpan);
div.appendChild(itemInfo);
div.appendChild(quantityControl);
div.appendChild(removeBtn);

list.appendChild(div);

total += Number(item.price) * item.quantity;

});

totalEl.innerText = total.toLocaleString();
}

function removeItem(itemName){

cart = cart.filter(item => item.name !== itemName);

localStorage.setItem("cart",JSON.stringify(cart));

renderCart();

}

function increaseQty(itemName){

cart.push({name:itemName, price:cart.find(i => i.name === itemName).price});

localStorage.setItem("cart",JSON.stringify(cart));

renderCart();

}

function decreaseQty(itemName){

const index = cart.findIndex(item => item.name === itemName);

if(index > -1){
cart.splice(index,1);
localStorage.setItem("cart",JSON.stringify(cart));
renderCart();
}

}

function goCheckout(){

window.location.href = "checkout.html";

}

renderCart();