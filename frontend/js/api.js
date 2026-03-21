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