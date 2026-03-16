let cart = JSON.parse(localStorage.getItem("cart")) || [];

const list = document.getElementById("cart-list");
const totalEl = document.getElementById("total-price");

function renderCart(){

list.innerHTML = "";

let total = 0;

cart.forEach((item,index)=>{

const div = document.createElement("div");
div.className = "cart-item";

div.innerHTML = `
<span>${item.name}</span>
<span class="price">${Number(item.price).toLocaleString()} ฿</span>
<button onclick="removeItem(${index})">Remove</button>
`;

list.appendChild(div);

total += Number(item.price);

});

totalEl.innerText = total.toLocaleString();
}

function removeItem(index){

cart.splice(index,1);

localStorage.setItem("cart",JSON.stringify(cart));

renderCart();

}

function goCheckout(){

window.location.href = "checkout.html";

}

renderCart();