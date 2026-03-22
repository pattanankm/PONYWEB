const API = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? "http://localhost:3000" : "https://sporty-warmly-shark.ngrok-free.dev"

export async function getPonies() {
  const res = await fetch(API + "/ponies");
  return await res.json();
}

async function login(email,password){
  const res = await fetch(API + "/customer/login",{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body: JSON.stringify({email,password})
  })

  return res.json()
}

async function register(username,email,password){
  const res = await fetch(API + "/customer/register",{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body: JSON.stringify({username,email,password})
  })

  return res.json()
}

export async function getReviews(pony_id) {
  const res = await fetch(API + "/review/" + pony_id);
  return res.json();
}

export async function addReview(customer_id, pony_id, rating, comment) {
  const res = await fetch(API + "/review", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customer_id, pony_id, rating, comment })
  });
  return res.json();
}

export async function getWishlist(customer_id) {
  const res = await fetch(API + '/wishlist/' + customer_id);
  return res.json();
}

export async function addToWishlist(customer_id, pony_id) {
  const res = await fetch(API + '/wishlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customer_id, pony_id })
  });
  return res.json();
}

export async function removeFromWishlist(wishlist_id) {
  const res = await fetch(API + '/wishlist/' + wishlist_id, {
    method: 'DELETE'
  });
  return res.json();
}

export async function addOrder(customer_id, total, items) {
  const res = await fetch(API + '/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customer_id, total, status: 'pending', items })
  });
  return res.json();
}